"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Building,
  CheckCircle,
  Circle,
  Cloud,
  CreditCard,
  Download,
  FilePlus2,
  FileText,
  Paperclip,
  PlaneTakeoff,
  User,
} from "lucide-react";

// OpenRouter API Configuration
const OPENROUTER_API_KEY =
  process.env.REACT_APP_OPENROUTER_API_KEY ||
  "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Loan Application Stages
const LOAN_STAGES = {
  WELCOME: "welcome",
  LOAN_TYPE: "loan_type",
  APPLICANT_BASIC: "applicant_basic",
  CONTACT_INFO: "contact_info",
  IDENTITY_INFO: "identity_info",
  ADDRESS_INFO: "address_info",
  LOAN_DETAILS: "loan_details",
  EMPLOYMENT_INFO: "employment_info",
  FINANCIAL_INFO: "financial_info",
  GUARANTOR_INFO: "guarantor_info",
  DOCUMENT_UPLOAD: "document_upload",
  REVIEW_CONFIRM: "review_confirm",
  COMPLETED: "completed",
};

// Loan Application Data Structure
const initialLoanData = {
  applicationInfo: {
    applicationNumber: null,
    applicationDate: new Date().toLocaleDateString("en-IN"),
    stage: LOAN_STAGES.WELCOME,
    completeness: 0,
  },
  loanType: null,
  applicant: {
    personalDetails: {},
    contactInfo: {},
    identityInfo: {},
    addressInfo: {},
  },
  loanDetails: {},
  employment: {},
  financialInfo: {
    bankAccounts: [],
    existingLoans: [],
    monthlyExpenses: {},
  },
  guarantors: [],
  documents: [],
  declarations: {},
};

// Loan Type Options
const LOAN_TYPES = {
  PERSONAL: "Personal Loan",
  VEHICLE: "Vehicle Loan",
  HOME: "Home Loan",
  BUSINESS: "Business Loan",
};

// OpenRouter API Client
class OpenRouterClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = OPENROUTER_BASE_URL;
  }

  async createChatCompletion(model, messages, tools = null, onStream = null) {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Loan Application Assistant",
    };

    const body = {
      model,
      messages,
      stream: onStream ? true : false,
      max_tokens: 1000,
      temperature: 0.7,
    };

    if (tools) {
      body.tools = tools;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API Error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        );
      }

      // Handle streaming response
      if (onStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  return fullContent;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    onStream(content, fullContent);
                  }
                } catch (parseError) {
                  continue;
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        return fullContent;
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated";
      }
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      throw error;
    }
  }
}

const openRouterClient = new OpenRouterClient(OPENROUTER_API_KEY);

// Loan Application Prompts for Different Stages
const getLoanApplicationPrompt = (stage, loanData, userMessage) => {
  const baseContext = `
You are an expert loan application assistant helping a bank clerk collect comprehensive loan application information through a conversational interface.

Current Application Data: ${JSON.stringify(loanData, null, 2)}
Current Stage: ${stage}
User Message: "${userMessage}"

IMPORTANT GUIDELINES:
1. Be professional, helpful, and thorough
2. Ask ONE focused question at a time
3. Extract and validate information from user responses
4. Provide clear guidance on required information
5. Handle Indian document formats (Aadhaar: 12 digits, PAN: AAAAA9999A)
6. Validate phone numbers (10 digits starting with 6-9)
7. Move to next stage only when current stage is complete
8. Acknowledge information received before asking next question

RESPONSE FORMAT:
- Acknowledge any information provided
- Ask the next relevant question
- Provide helpful context when needed
- Be conversational but professional
`;

  const stagePrompts = {
    [LOAN_STAGES.WELCOME]: `
${baseContext}

You're starting a new loan application. Welcome the user and explain the process briefly.
Ask what type of loan the customer is applying for.

Available loan types: Personal Loan, Vehicle Loan, Home Loan, Business Loan

Keep it warm and professional.
`,

    [LOAN_STAGES.LOAN_TYPE]: `
${baseContext}

The user has indicated their loan type preference. 
- Extract the loan type from their message
- Ask about the purpose of the loan and approximate amount needed
- Provide relevant context based on loan type

If loan type is unclear, ask for clarification.
`,

    [LOAN_STAGES.APPLICANT_BASIC]: `
${baseContext}

Collect basic personal information:
- Full name (first name, last name)
- Father's name
- Date of birth (DD/MM/YYYY format)
- Gender
- Marital status

Focus on one piece of information at a time. Be patient and thorough.
`,

    [LOAN_STAGES.CONTACT_INFO]: `
${baseContext}

Collect contact information:
- Mobile number (validate 10 digits, starting with 6-9)
- Alternate number (optional)
- Email address

Validate formats and ask for corrections if needed.
`,

    [LOAN_STAGES.IDENTITY_INFO]: `
${baseContext}

Collect identity information:
- Aadhaar number (12 digits, validate format)
- PAN number (format: AAAAA9999A)
- Voter ID (optional)
- Passport number (optional)

Ensure proper formatting and validate as you collect.
`,

    [LOAN_STAGES.ADDRESS_INFO]: `
${baseContext}

Collect complete address details:
- Current address (line 1, line 2, city, state, PIN code)
- Years at current address
- Residence type (Owned/Rented/Family)
- Permanent address (ask if same as current)

Be thorough with address collection as it's crucial for verification.
`,

    [LOAN_STAGES.LOAN_DETAILS]: `
${baseContext}

Collect detailed loan information:
- Exact loan amount required
- Preferred tenure (in months)
- Purpose/use of loan funds
- Any collateral offered
- Whether guarantor is available

Provide guidance on typical ranges for the loan type.
`,

    [LOAN_STAGES.EMPLOYMENT_INFO]: `
${baseContext}

Collect employment/income information:
- Employment type (Salaried/Self-employed/Business/Professional)
- Company name and designation (if salaried)
- Business details (if self-employed/business)
- Monthly income
- Work experience
- Company address

Adapt questions based on employment type.
`,

    [LOAN_STAGES.FINANCIAL_INFO]: `
${baseContext}

Collect financial information:
- Bank account details (bank name, account type, balance)
- Existing loans (lender, type, outstanding amount, EMI)
- Credit card details (if any)
- Monthly expenses breakdown

This is sensitive information - handle professionally.
`,

    [LOAN_STAGES.GUARANTOR_INFO]: `
${baseContext}

Check if guarantor is required and collect details:
- Whether guarantor is needed (based on loan type/amount)
- Guarantor personal details
- Guarantor employment information
- Relationship with applicant

Only collect if actually required for the loan type.
`,

    [LOAN_STAGES.DOCUMENT_UPLOAD]: `
${baseContext}

Guide document collection:
- List required documents for this loan type
- Check which documents customer has ready
- Provide guidance on document requirements
- Confirm document submission plan

Be specific about document requirements.
`,

    [LOAN_STAGES.REVIEW_CONFIRM]: `
${baseContext}

Review all collected information:
- Summarize key details
- Ask for confirmation
- Handle any corrections needed
- Explain next steps in the process

Be thorough in review - this is the final check.
`,
  };

  return stagePrompts[stage] || baseContext;
};

// Parse AI response to extract data and determine next stage
const parseAIResponse = (response, currentStage, currentData) => {
  // This would typically use a more sophisticated parser
  // For now, we'll use simple keyword detection and stage progression logic

  let extractedData = { ...currentData };
  let nextStage = currentStage;
  let shouldAdvanceStage = false;

  // Stage progression logic
  switch (currentStage) {
    case LOAN_STAGES.WELCOME:
      if (
        response.toLowerCase().includes("personal") ||
        response.toLowerCase().includes("vehicle") ||
        response.toLowerCase().includes("home") ||
        response.toLowerCase().includes("business")
      ) {
        nextStage = LOAN_STAGES.LOAN_TYPE;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.LOAN_TYPE:
      // Extract loan type and amount
      if (response.toLowerCase().includes("personal")) {
        extractedData.loanType = "PERSONAL";
        shouldAdvanceStage = true;
      } else if (response.toLowerCase().includes("vehicle") || response.toLowerCase().includes("car")) {
        extractedData.loanType = "VEHICLE";
        shouldAdvanceStage = true;
      } else if (response.toLowerCase().includes("home") || response.toLowerCase().includes("house")) {
        extractedData.loanType = "HOME";
        shouldAdvanceStage = true;
      } else if (response.toLowerCase().includes("business")) {
        extractedData.loanType = "BUSINESS";
        shouldAdvanceStage = true;
      }

      if (shouldAdvanceStage) {
        nextStage = LOAN_STAGES.APPLICANT_BASIC;
      }
      break;

    case LOAN_STAGES.APPLICANT_BASIC:
      // Simple name extraction logic
      if (response.toLowerCase().includes("name")) {
        nextStage = LOAN_STAGES.CONTACT_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.CONTACT_INFO:
      // Check for phone number pattern
      const phoneMatch = response.match(/[6-9]\d{9}/);
      if (phoneMatch) {
        extractedData.applicant.contactInfo.mobileNumber = phoneMatch[0];
        nextStage = LOAN_STAGES.IDENTITY_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.IDENTITY_INFO:
      // Check for Aadhaar/PAN
      const aadhaarMatch = response.match(/\d{12}/);
      const panMatch = response.match(/[A-Z]{5}\d{4}[A-Z]/);
      if (aadhaarMatch || panMatch) {
        if (aadhaarMatch) extractedData.applicant.identityInfo.aadharNumber = aadhaarMatch[0];
        if (panMatch) extractedData.applicant.identityInfo.panNumber = panMatch[0];
        nextStage = LOAN_STAGES.ADDRESS_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.ADDRESS_INFO:
      if (response.toLowerCase().includes("address") || response.toLowerCase().includes("city")) {
        nextStage = LOAN_STAGES.LOAN_DETAILS;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.LOAN_DETAILS:
      // Check for amount pattern
      const amountMatch = response.match(/(\d+)\s*(lakh|thousand|crore|₹)/i);
      if (amountMatch) {
        nextStage = LOAN_STAGES.EMPLOYMENT_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.EMPLOYMENT_INFO:
      if (
        response.toLowerCase().includes("company") ||
        response.toLowerCase().includes("salary") ||
        response.toLowerCase().includes("income")
      ) {
        nextStage = LOAN_STAGES.FINANCIAL_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.FINANCIAL_INFO:
      if (response.toLowerCase().includes("bank") || response.toLowerCase().includes("account")) {
        nextStage = LOAN_STAGES.GUARANTOR_INFO;
        shouldAdvanceStage = true;
      }
      break;

    case LOAN_STAGES.GUARANTOR_INFO:
      nextStage = LOAN_STAGES.DOCUMENT_UPLOAD;
      shouldAdvanceStage = true;
      break;

    case LOAN_STAGES.DOCUMENT_UPLOAD:
      nextStage = LOAN_STAGES.REVIEW_CONFIRM;
      shouldAdvanceStage = true;
      break;

    case LOAN_STAGES.REVIEW_CONFIRM:
      if (response.toLowerCase().includes("confirm") || response.toLowerCase().includes("correct")) {
        nextStage = LOAN_STAGES.COMPLETED;
        shouldAdvanceStage = true;
      }
      break;
  }

  // Update stage in application data
  if (shouldAdvanceStage) {
    extractedData.applicationInfo.stage = nextStage;
    extractedData.applicationInfo.completeness = calculateCompleteness(extractedData);
  }

  return extractedData;
};

// Calculate application completeness
const calculateCompleteness = (loanData) => {
  let totalFields = 20; // Estimate of total required fields
  let completedFields = 0;

  if (loanData.loanType) completedFields++;
  if (loanData.applicant?.contactInfo?.mobileNumber) completedFields++;
  if (loanData.applicant?.identityInfo?.aadharNumber) completedFields++;
  if (loanData.applicant?.identityInfo?.panNumber) completedFields++;
  // Add more field checks...

  return Math.round((completedFields / totalFields) * 100);
};

// Enhanced chat function for loan applications
const streamLoanChat = async (
  message,
  loanData,
  setLoanData,
  modelName = "anthropic/claude-3.5-sonnet",
  onStream = null,
) => {
  try {
    const currentStage = loanData.applicationInfo.stage;
    const prompt = getLoanApplicationPrompt(currentStage, loanData, message);

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    const response = await openRouterClient.createChatCompletion(modelName, messages, null, onStream);

    // Update loan data based on response
    const updatedData = parseAIResponse(message, currentStage, loanData);
    setLoanData(updatedData);

    return response;
  } catch (error) {
    console.error("Loan chat error:", error);
    throw error;
  }
};

function LoanApplicationChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [currentModel, setCurrentModel] = useState("anthropic/claude-3.5-sonnet");
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [loanData, setLoanData] = useState(initialLoanData);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate application number on first interaction
  useEffect(() => {
    if (!loanData.applicationInfo.applicationNumber && messages.length > 0) {
      const appNumber = `LA${Date.now().toString().slice(-8)}`;
      setLoanData((prev) => ({
        ...prev,
        applicationInfo: {
          ...prev.applicationInfo,
          applicationNumber: appNumber,
        },
      }));
    }
  }, [messages.length, loanData.applicationInfo.applicationNumber]);

  const handleSubmit = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    if (OPENROUTER_API_KEY === "YOUR_API_KEY_HERE" || !OPENROUTER_API_KEY) {
      setApiError("Please configure your OpenRouter API key");
      return;
    }

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);
    setApiError(null);

    const aiMessageId = Date.now().toString();
    const placeholderAiMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      model: currentModel,
      isStreaming: true,
      stage: loanData.applicationInfo.stage,
    };

    setMessages((prev) => [...prev, placeholderAiMessage]);
    setStreamingMessageId(aiMessageId);

    try {
      const onStream = (chunk, fullContent) => {
        setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: fullContent } : msg)));
      };

      const finalResponse = await streamLoanChat(messageText, loanData, setLoanData, currentModel, onStream);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: finalResponse,
                isStreaming: false,
                stage: loanData.applicationInfo.stage,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`,
                isError: true,
                isStreaming: false,
              }
            : msg,
        ),
      );
      setApiError(error.message);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setShowDropdown(false);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const generateApplicationPDF = () => {
    // This would integrate with your PDF generation system
    alert(`Generating PDF for application ${loanData.applicationInfo.applicationNumber}...`);
  };

  const getStageIcon = (stage) => {
    const iconMap = {
      [LOAN_STAGES.WELCOME]: <PlaneTakeoff className="h-4 w-4" />,
      [LOAN_STAGES.LOAN_TYPE]: <CreditCard className="h-4 w-4" />,
      [LOAN_STAGES.APPLICANT_BASIC]: <User className="h-4 w-4" />,
      [LOAN_STAGES.CONTACT_INFO]: <User className="h-4 w-4" />,
      [LOAN_STAGES.IDENTITY_INFO]: <FileText className="h-4 w-4" />,
      [LOAN_STAGES.ADDRESS_INFO]: <Building className="h-4 w-4" />,
      [LOAN_STAGES.LOAN_DETAILS]: <CreditCard className="h-4 w-4" />,
      [LOAN_STAGES.EMPLOYMENT_INFO]: <Building className="h-4 w-4" />,
      [LOAN_STAGES.FINANCIAL_INFO]: <CreditCard className="h-4 w-4" />,
      [LOAN_STAGES.GUARANTOR_INFO]: <User className="h-4 w-4" />,
      [LOAN_STAGES.DOCUMENT_UPLOAD]: <FileText className="h-4 w-4" />,
      [LOAN_STAGES.REVIEW_CONFIRM]: <CheckCircle className="h-4 w-4" />,
    };
    return iconMap[stage] || <Circle className="h-4 w-4" />;
  };

  const loanApplicationPrompts = [
    {
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      text: "Start Personal Loan Application",
      prompt: "I want to apply for a personal loan",
    },
    {
      icon: <Building className="h-6 w-6 text-green-500" />,
      text: "Start Vehicle Loan Application",
      prompt: "I need a vehicle loan for buying a car",
    },
    {
      icon: <User className="h-6 w-6 text-purple-500" />,
      text: "Start Home Loan Application",
      prompt: "I want to apply for a home loan",
    },
    {
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      text: "Start Business Loan Application",
      prompt: "I need a business loan for my company",
    },
  ];

  return (
    <div className="flex h-[calc(100vh-65px)] w-full bg-gray-50">
      {/* Sidebar - Application Progress */}
      <div className="w-80 border-r border-gray-200 bg-white p-4">
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-900">Loan Application Progress</div>

          {loanData.applicationInfo.applicationNumber && (
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-sm font-medium text-blue-900">
                Application ID: {loanData.applicationInfo.applicationNumber}
              </div>
              <div className="text-xs text-blue-600">Started: {loanData.applicationInfo.applicationDate}</div>
              <div className="mt-2">
                <div className="mb-1 text-xs text-blue-600">Completeness: {loanData.applicationInfo.completeness}%</div>
                <div className="h-2 w-full rounded-full bg-blue-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${loanData.applicationInfo.completeness}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {loanData.loanType && (
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-sm font-medium text-green-900">Loan Type: {LOAN_TYPES[loanData.loanType]}</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Current Stage:</div>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              {getStageIcon(loanData.applicationInfo.stage)}
              <span className="capitalize">{loanData.applicationInfo.stage.replace("_", " ")}</span>
            </div>
          </div>

          {loanData.applicationInfo.completeness >= 80 && (
            <button
              onClick={generateApplicationPDF}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Generate PDF</span>
            </button>
          )}

          <div className="mt-6 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Collected Information</div>
            <div className="space-y-1 text-xs text-gray-600">
              {loanData.applicant?.contactInfo?.mobileNumber && (
                <div>📱 Phone: {loanData.applicant.contactInfo.mobileNumber}</div>
              )}
              {loanData.applicant?.identityInfo?.panNumber && (
                <div>🆔 PAN: {loanData.applicant.identityInfo.panNumber}</div>
              )}
              {loanData.applicant?.identityInfo?.aadharNumber && (
                <div>🆔 Aadhaar: ****{loanData.applicant.identityInfo.aadharNumber.slice(-4)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {apiError && (
            <div className="mx-4 mt-4 rounded border-l-4 border-red-400 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>API Error:</strong> {apiError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center px-6 py-6">
              <div className="flex max-w-4xl flex-col items-center justify-center gap-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-gray-900">Loan Application Assistant</h1>
                  <p className="text-gray-600">I'll help you complete your loan application step by step</p>
                </div>

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {loanApplicationPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmit(prompt.prompt)}
                      className="flex w-full flex-col items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:border-gray-300 hover:shadow-md"
                    >
                      {prompt.icon}
                      <span className="line-clamp-2 text-left text-sm text-gray-600">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "ml-auto bg-blue-500 text-white"
                        : message.isError
                          ? "border border-red-200 bg-red-50 text-red-800"
                          : "border border-gray-200 bg-white shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-gray-400"></span>
                      )}
                    </div>
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            📎 {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {message.stage && message.role === "assistant" && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        {getStageIcon(message.stage)}
                        <span className="ml-1 capitalize">
                          {message.stage.replace("_", " ")} {message.isStreaming && "(processing...)"}
                        </span>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && !streamingMessageId && (
                <div className="flex justify-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="mx-auto max-w-4xl">
            {/* Model Selection */}
            <div className="mb-3 flex items-center justify-between">
              <select
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs"
                disabled={isLoading}
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                <option value="google/gemini-pro">Gemini Pro</option>
                <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
              </select>
              <div className="text-xs text-gray-500">
                {OPENROUTER_API_KEY === "YOUR_API_KEY_HERE" ? "API Key not configured" : "Loan Assistant Ready ✓"}
              </div>
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-3 rounded-lg bg-gray-50 p-2">
                <div className="mb-2 text-xs text-gray-600">Documents attached:</div>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded bg-white px-2 py-1 text-xs">
                      <span>
                        📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button onClick={() => removeFile(index)} className="ml-2 text-red-500 hover:text-red-700">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions for Current Stage */}
            {loanData.applicationInfo.stage !== LOAN_STAGES.WELCOME && (
              <div className="mb-3 flex flex-wrap gap-2">
                {loanData.applicationInfo.stage === LOAN_STAGES.LOAN_TYPE && (
                  <>
                    <button
                      onClick={() => handleSubmit("I need a personal loan of 5 lakhs")}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
                      disabled={isLoading}
                    >
                      Personal Loan - 5L
                    </button>
                    <button
                      onClick={() => handleSubmit("I want a car loan of 8 lakhs")}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200"
                      disabled={isLoading}
                    >
                      Vehicle Loan - 8L
                    </button>
                  </>
                )}

                {loanData.applicationInfo.stage === LOAN_STAGES.EMPLOYMENT_INFO && (
                  <>
                    <button
                      onClick={() => handleSubmit("I am salaried employee")}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 hover:bg-purple-200"
                      disabled={isLoading}
                    >
                      Salaried
                    </button>
                    <button
                      onClick={() => handleSubmit("I am self-employed")}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 hover:bg-orange-200"
                      disabled={isLoading}
                    >
                      Self-Employed
                    </button>
                    <button
                      onClick={() => handleSubmit("I run a business")}
                      className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200"
                      disabled={isLoading}
                    >
                      Business Owner
                    </button>
                  </>
                )}

                {loanData.applicationInfo.stage === LOAN_STAGES.DOCUMENT_UPLOAD && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-200"
                    disabled={isLoading}
                  >
                    📎 Upload Documents
                  </button>
                )}
              </div>
            )}

            <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full bg-gray-100 px-2 py-2">
              {/* Attachment Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="rounded-full p-3 transition-colors hover:bg-gray-200"
                  disabled={isLoading}
                >
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </button>

                {showDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        alert("Google Drive integration would connect here");
                        setShowDropdown(false);
                      }}
                      disabled={isLoading}
                    >
                      <Cloud className="h-4 w-4" />
                      Connect to Google Drive
                    </button>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowDropdown(false);
                      }}
                      disabled={isLoading}
                    >
                      <FilePlus2 className="h-4 w-4" />
                      Upload Documents
                    </button>
                    <div className="mx-4 my-2 border-t border-gray-100"></div>
                    <div className="px-4 py-2">
                      <div className="mb-1 text-xs font-medium text-gray-500">Suggested Documents:</div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {loanData.loanType === "PERSONAL" && (
                          <>
                            <div>• Aadhaar Card</div>
                            <div>• PAN Card</div>
                            <div>• Salary Slips (3 months)</div>
                            <div>• Bank Statements</div>
                          </>
                        )}
                        {loanData.loanType === "VEHICLE" && (
                          <>
                            <div>• Vehicle Quotation</div>
                            <div>• Income Proof</div>
                            <div>• Identity Documents</div>
                            <div>• Address Proof</div>
                          </>
                        )}
                        {loanData.loanType === "HOME" && (
                          <>
                            <div>• Property Documents</div>
                            <div>• Income Tax Returns</div>
                            <div>• Property Valuation</div>
                            <div>• NOC from Builder</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.jpg,.jpeg,.png"
              />

              {/* Text Input */}
              <input
                type="text"
                placeholder={
                  loanData.applicationInfo.stage === LOAN_STAGES.WELCOME
                    ? "Hi! What type of loan do you need help with today?"
                    : loanData.applicationInfo.stage === LOAN_STAGES.LOAN_TYPE
                      ? "Tell me about the loan amount and purpose..."
                      : loanData.applicationInfo.stage === LOAN_STAGES.APPLICANT_BASIC
                        ? "Let's start with your full name..."
                        : loanData.applicationInfo.stage === LOAN_STAGES.CONTACT_INFO
                          ? "What's your mobile number?"
                          : loanData.applicationInfo.stage === LOAN_STAGES.IDENTITY_INFO
                            ? "Please provide your Aadhaar and PAN numbers..."
                            : loanData.applicationInfo.stage === LOAN_STAGES.ADDRESS_INFO
                              ? "Tell me your current address..."
                              : loanData.applicationInfo.stage === LOAN_STAGES.EMPLOYMENT_INFO
                                ? "About your employment and income..."
                                : loanData.applicationInfo.stage === LOAN_STAGES.FINANCIAL_INFO
                                  ? "Bank account and financial details..."
                                  : loanData.applicationInfo.stage === LOAN_STAGES.DOCUMENT_UPLOAD
                                    ? "Let's collect the required documents..."
                                    : "Continue with your loan application..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 border-none bg-transparent px-2 text-gray-900 placeholder-gray-500 outline-none"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className={`rounded-full p-3 transition-colors ${
                  input.trim() && !isLoading
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                Loan Application Assistant • Current stage: {loanData.applicationInfo.stage.replace("_", " ")}
              </span>
              <span>Using {currentModel.split("/")[1] || currentModel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanApplicationChatInterface;
