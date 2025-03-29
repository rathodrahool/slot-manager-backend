import { Transporter, createTransport } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  MailOptions,
} from '@shared/constants/types';
import { renderFile } from 'ejs';
import { join } from 'path';
import { EMAIL } from '@shared/constants/constant';
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(mailOptions: MailOptions) {
    if (!mailOptions?.from) {
      const fromEmail = process.env.MAIL_FROM;
      Object.assign(mailOptions, { from: `<${fromEmail}>` });
    }

    this.transporter.sendMail(mailOptions, (err: Error | null) => {
      if (err) {
        throw new Error(err.message);
      } else {
        this.handleAttachments(mailOptions.attachments);
      }
    });
  }

  private handleAttachments(attachments?: MailOptions['attachments']) {
    if (attachments) {
      attachments.forEach((element) => {
        if (element.path) {
          fs.unlinkSync(path.join('public', path.basename(element.path)));
        } else {
          throw new Error(`Attachment path not found: ${element.filename}`);
        }
      });
    }
  }

  async renderTemplate(templateName: string, data: object): Promise<string> {
    const templatePath = join(
      process.cwd(),
      'src',
      'shared',
      'templates',
      `${templateName}.ejs`,
    );
    return new Promise<string>((resolve, reject) => {
      renderFile(templatePath, data, (err, str) => {
        if (err) {
          return reject(err);
        }
        resolve(str);
      });
    });
  }

  async sendOtpEmail(
    email: string,
    otp: number,
    expireAt: number,
  ): Promise<void> {
    const html = await this.renderTemplate('verification-otp', {
      otp,
      expireAt,
    });

    const mailOptions = {
      to: email,
      subject: EMAIL.VERIFICATION_OTP_SUBJECT,
      html,
    };
    await this.sendMail(mailOptions);
  }


}