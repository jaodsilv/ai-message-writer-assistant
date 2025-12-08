import { describe, it, expect } from 'vitest';
import { MessageParserService } from './MessageParserService';

describe('MessageParserService', () => {
    const service = new MessageParserService();

    it('should parse a LinkedIn message correctly', () => {
        const input = `Sarah Johnson
(She/Her)
2nd degree connection
· 2nd
Talent Partner @ Amazon Robotics
Verified recruiter
Monday
Sarah Johnson sent the following messages at 2:30 PM
View Sarah's profile
Sarah Johnson, #HIRING
Sarah Johnson (She/Her)  2:30 PM
👏
👍
😊
+
Exciting Backend Opportunity!
Hi João! I came across your profile and was impressed by your backend engineering experience. We have an exciting opportunity at Amazon Robotics for a Senior Backend Engineer. The role offers competitive compensation around $180k. Would you be interested in learning more?`;

        const result = service.parse(input);

        expect(result.platform).toBe('linkedin');
        expect(result.recruiterName).toBe('Sarah Johnson');
        expect(result.company).toBe('Amazon Robotics');
        expect(result.messageBody).toContain('Hi João! I came across your profile');
        expect(result.subject).toBe('Exciting Backend Opportunity!');
    });

    it('should parse an Email message correctly', () => {
        const input = `Senior Data Engineer - Remote Opportunity

Michael Chen <mchen@techrecruiting.com>
Tue, Jan 14, 2025, 10:45 AM
to João

Hi João,

I hope this email finds you well. I'm reaching out regarding a Senior Data Engineer position with one of our clients in the fintech space.`;

        const result = service.parse(input);

        expect(result.platform).toBe('email');
        expect(result.recruiterName).toBe('Michael Chen');
        expect(result.email).toBe('mchen@techrecruiting.com');
        expect(result.subject).toBe('Senior Data Engineer - Remote Opportunity');
        expect(result.messageBody).toContain('Hi João,');
    });
});
