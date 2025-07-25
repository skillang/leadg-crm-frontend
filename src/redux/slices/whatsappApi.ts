// src/redux/slices/whatsappApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  WhatsAppTemplate,
  AccountStatusResponse,
  ContactValidationResponse,
  SendTemplateResponse,
  SendTextResponse,
} from "@/models/types/whatsapp";
import { createBaseQueryWithReauth } from "../utils/baseQuerryWithReauth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface TemplateMessageRequest {
  template_name: string;
  contact: string;
  lead_name: string;
}

interface TextMessageRequest {
  contact: string;
  message: string;
}

// Define the raw template response structure
interface TemplateApiResponse {
  data?: WhatsAppTemplate[];
  templates?: WhatsAppTemplate[];
  [key: string]: unknown;
}

const baseQuery = createBaseQueryWithReauth(API_BASE_URL);

export const whatsappApi = createApi({
  reducerPath: "whatsappApi",
  baseQuery: baseQuery,
  tagTypes: ["WhatsAppStatus", "Templates"],
  endpoints: (builder) => ({
    // Check WhatsApp account status
    checkAccountStatus: builder.query<AccountStatusResponse, void>({
      query: () => "/account/status",
      providesTags: ["WhatsAppStatus"],
    }),

    // Validate contact number
    validateContact: builder.mutation<ContactValidationResponse, string>({
      query: (contact) => ({
        url: "/validate-contact",
        method: "POST",
        body: { contact },
      }),
    }),

    // Get available templates
    getTemplates: builder.query<WhatsAppTemplate[], void>({
      query: () => "/templates",
      providesTags: ["Templates"],
      transformResponse: (
        response: TemplateApiResponse | WhatsAppTemplate[]
      ) => {
        // Handle both direct array response and wrapped response
        if (Array.isArray(response)) {
          return response;
        }
        // Check for common response wrapper patterns
        return response.data || response.templates || [];
      },
    }),

    // Send template message
    sendTemplate: builder.mutation<
      SendTemplateResponse,
      TemplateMessageRequest
    >({
      query: ({ template_name, contact, lead_name }) => ({
        url: "/send-template",
        method: "POST",
        body: {
          template_name,
          contact,
          lead_name,
        },
      }),
      invalidatesTags: ["WhatsAppStatus"],
    }),

    // Send text message
    sendTextMessage: builder.mutation<SendTextResponse, TextMessageRequest>({
      query: ({ contact, message }) => ({
        url: "/send-text",
        method: "POST",
        body: {
          contact,
          message,
        },
      }),
      invalidatesTags: ["WhatsAppStatus"],
    }),
  }),
});

export const {
  useCheckAccountStatusQuery,
  useValidateContactMutation,
  useGetTemplatesQuery,
  useSendTemplateMutation,
  useSendTextMessageMutation,
} = whatsappApi;
