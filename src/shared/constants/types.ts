import {  OtpType } from './enum';

export interface IJwtPayload {
  id: string;
}
export interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | Array<string>;
  bcc?: string | Array<string>;
  attachments?: {
    filename?: string | false | undefined;
    content?: string | Buffer | undefined;
    path?: string | undefined;
    href?: string | undefined;
    folder?: string;
    contentType?: string | undefined;
  }[];
  dynamicTemplateData?: { [key: string]: any } | undefined;
}

export interface OtpPayload {
  otp: number;
  expire_at: Date;
  type: OtpType;
  user: { id: string };
}

export type AllSectionPermission = {
  id: string;
  name: string;
  permission: {
    id: string;
    name: string;
  }[];
};

export interface FindAllQuery {
  limit: number;
  offset: number;
  search: string;
  order: { [key: string]: 'ASC' | 'DESC' };
}













