/* eslint-disable @typescript-eslint/no-explicit-any */
// File: gmailApiSender.ts

import fs from 'fs';
import path from 'path';
import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ExcelGenerator } from './ExcelGenerator';

class GmailApiSender {
    private gmail: gmail_v1.Gmail;
    private oAuth2Client: OAuth2Client;
    private user: string;

    constructor(credentials: {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        refreshToken: string;
    }, user: string = 'me') {
        this.user = user;
        this.oAuth2Client = new OAuth2Client(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUri
        );

        this.oAuth2Client.setCredentials({
            refresh_token: credentials.refreshToken
        });

        this.gmail = google.gmail({
            version: 'v1',
            auth: this.oAuth2Client
        });
    }

    /**
     * Creates a base64 encoded email with attachments
     */
    private async createMessage(
        to: string | string[],
        subject: string,
        messageText: string,
        attachmentPaths?: string[],
        attachmentBuffers?: Array<{ filename: string, buffer: Buffer, mimeType: string }>
    ): Promise<string> {
        const recipients = Array.isArray(to) ? to.join(', ') : to;

        // Generate a boundary for multipart message
        const boundary = `----MessagePart_${Math.random().toString(36).substring(2)}`;

        let emailContent = [
            `From: ${this.user}`,
            `To: ${recipients}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 7bit',
            '',
            messageText,
            ''
        ].join('\r\n');

        // Add file attachments if provided
        if (attachmentPaths && attachmentPaths.length > 0) {
            for (const attachmentPath of attachmentPaths) {
                const filename = path.basename(attachmentPath);
                const fileContent = fs.readFileSync(attachmentPath, { encoding: 'base64' });

                // Detect MIME type based on file extension
                const ext = path.extname(filename).toLowerCase();
                let mimeType = 'application/octet-stream'; // Default MIME type

                if (ext === '.pdf') mimeType = 'application/pdf';
                else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                else if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.txt') mimeType = 'text/plain';
                else if (ext === '.doc' || ext === '.docx') mimeType = 'application/msword';
                else if (ext === '.xls' || ext === '.xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                emailContent += [
                    `--${boundary}`,
                    `Content-Type: ${mimeType}; name="${filename}"`,
                    'Content-Transfer-Encoding: base64',
                    `Content-Disposition: attachment; filename="${filename}"`,
                    '',
                    fileContent.replace(/(.{76})/g, "$1\r\n"),
                    ''
                ].join('\r\n');
            }
        }

        // Add buffer attachments if provided
        if (attachmentBuffers && attachmentBuffers.length > 0) {
            for (const { filename, buffer, mimeType } of attachmentBuffers) {
                const fileContent = buffer.toString('base64');

                emailContent += [
                    `--${boundary}`,
                    `Content-Type: ${mimeType}; name="${filename}"`,
                    'Content-Transfer-Encoding: base64',
                    `Content-Disposition: attachment; filename="${filename}"`,
                    '',
                    fileContent.replace(/(.{76})/g, "$1\r\n"),
                    ''
                ].join('\r\n');
            }
        }

        // Close the boundary
        emailContent += `--${boundary}--`;

        // Base64url encode the email
        const encodedMessage = Buffer.from(emailContent)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return encodedMessage;
    }

    /**
     * Send an email with optional attachments using Gmail API
     */
    async sendEmail(
        to: string | string[],
        subject: string,
        messageText: string,
        attachmentPaths?: string[],
        attachmentBuffers?: Array<{ filename: string, buffer: Buffer, mimeType: string }>
    ): Promise<string> {
        try {
            const encodedMessage = await this.createMessage(to, subject, messageText, attachmentPaths, attachmentBuffers);

            const response = await this.gmail.users.messages.send({
                userId: this.user,
                requestBody: {
                    raw: encodedMessage
                }
            });

            console.log('Email sent successfully:', response.data.id);
            return response.data.id || '';
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Send an email with Excel attachment generated from JSON data
     * @param to Recipient email address(es)
     * @param subject Email subject
     * @param messageText Email body text
     * @param jsonData JSON data to convert to Excel
     * @param filename Name for the Excel file attachment
     * @param sheetName Name of the worksheet (optional)
     * @returns Message ID if successful
     */
    async sendEmailWithExcelFromJson(
        to: string | string[],
        subject: string,
        messageText: string,
        jsonData: any[],
        filename: string = 'data.xlsx',
        sheetName: string = 'Sheet1'
    ): Promise<string> {
        try {
            // Generate Excel buffer from JSON data
            const excelBuffer = ExcelGenerator.createExcelBuffer(jsonData, sheetName);

            // Send email with the Excel buffer as attachment
            return await this.sendEmail(
                to,
                subject,
                messageText,
                undefined,
                [{
                    filename,
                    buffer: excelBuffer,
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }]
            );
        } catch (error) {
            console.error('Error sending email with Excel attachment:', error);
            throw error;
        }
    }

    /**
     * Get OAuth2 authorization URL to get a refresh token
     */
    static getAuthUrl(
        clientId: string,
        clientSecret: string,
        redirectUri: string
    ): string {
        const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.send'],
            prompt: 'consent'
        });
    }

    /**
     * Get refresh token from authorization code
     */
    static async getRefreshToken(
        clientId: string,
        clientSecret: string,
        redirectUri: string,
        code: string
    ): Promise<string> {
        const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
        const { tokens } = await oAuth2Client.getToken(code);

        if (!tokens.refresh_token) {
            throw new Error('No refresh token returned. Make sure you set prompt=consent in the auth URL.');
        }

        return tokens.refresh_token;
    }
}


export default GmailApiSender;