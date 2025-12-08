export interface ParsedData {
    platform: 'linkedin' | 'email' | 'unknown';
    recruiterName?: string;
    company?: string;
    recruitingCompany?: string;
    isContract?: boolean;
    date?: Date;
    subject?: string;
    messageBody?: string;
    email?: string;
}

export class MessageParserService {
    parse(text: string): ParsedData {
        // Try LinkedIn format
        if (text.includes('degree connection') || text.includes('sent the following messages at')) {
            return this.parseLinkedIn(text);
        }

        // Try Email format
        if (text.includes('<') && text.includes('>')) {
            return this.parseEmail(text);
        }

        return {
            platform: 'unknown'
        };
    }

    private parseLinkedIn(text: string): ParsedData {
        const lines = text.split('\n');
        const recruiterName = lines[0].trim();

        let company = '';
        // Try to find title line (usually line 4 or 5, depending on pronouns)
        // Pattern: "Talent Partner @ Amazon Robotics"
        for (const line of lines) {
            if (line.includes('@') || line.includes(' at ')) {
                const parts = line.split(/@| at /);
                if (parts.length > 1) {
                    company = parts[parts.length - 1].trim();
                    break;
                }
            }
        }

        // Extract subject and body
        let bodyStartIndex = -1;
        let subject = '';

        // Find the line that looks like "Name [Pronouns] Time"
        // This is usually the immediate precursor to the message (or reactions)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            // Check for time pattern at end of line
            if (line.match(/\d{1,2}:\d{2} [AP]M$/)) {
                // This is likely the message header
                // Check if next lines are reactions
                let j = i + 1;
                while (j < lines.length && (['👏', '👍', '😊', '+'].includes(lines[j].trim()) || lines[j].trim() === '')) {
                    j++;
                }

                if (j < lines.length) {
                    const potentialSubject = lines[j];
                    const nextLine = lines[j + 1] || '';

                    if (nextLine.trim().startsWith('Hi ') || nextLine.trim().startsWith('Hello ') || nextLine.trim().startsWith('Dear ')) {
                        subject = potentialSubject.trim();
                        bodyStartIndex = j + 1;
                    } else {
                        // Maybe no subject, just body
                        bodyStartIndex = j;
                    }
                    break; // Found it
                }
            }
        }

        // Fallback: if we didn't find it via time, look for "sent the following messages at"
        if (bodyStartIndex === -1) {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('sent the following messages at')) {
                    // Skip known metadata lines that might follow
                    // View profile, Name, Name Time...
                    let j = i + 1;
                    while (j < lines.length) {
                        const l = lines[j].trim();
                        if (l.startsWith('View ') || l.includes('#HIRING') || l.match(/\d{1,2}:\d{2} [AP]M$/) || ['👏', '👍', '😊', '+'].includes(l) || l === '') {
                            j++;
                        } else {
                            break;
                        }
                    }

                    if (j < lines.length) {
                        const potentialSubject = lines[j];
                        const nextLine = lines[j + 1] || '';
                        if (nextLine.trim().startsWith('Hi ') || nextLine.trim().startsWith('Hello ') || nextLine.trim().startsWith('Dear ')) {
                            subject = potentialSubject.trim();
                            bodyStartIndex = j + 1;
                        } else {
                            bodyStartIndex = j;
                        }
                    }
                    break;
                }
            }
        }

        const messageBody = bodyStartIndex !== -1 ? lines.slice(bodyStartIndex).join('\n').trim() : '';

        return {
            platform: 'linkedin',
            recruiterName,
            company,
            subject,
            messageBody
        };
    }

    private parseEmail(text: string): ParsedData {
        const lines = text.split('\n');

        // Subject is usually the first line
        const subject = lines[0].trim();

        // Find From line: "Name <email>"
        let recruiterName = '';
        let email = '';
        let fromLineIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/(.*) <(.*)>/);
            if (match) {
                recruiterName = match[1].trim();
                email = match[2].trim();
                fromLineIndex = i;
                break;
            }
        }

        // Body usually starts after "to Name"
        let bodyStartIndex = -1;
        for (let i = fromLineIndex + 1; i < lines.length; i++) {
            if (lines[i].trim().startsWith('to ')) {
                bodyStartIndex = i + 2; // Skip "to Name" and empty line
                break;
            }
        }

        const messageBody = bodyStartIndex !== -1 ? lines.slice(bodyStartIndex).join('\n').trim() : '';

        return {
            platform: 'email',
            recruiterName,
            email,
            subject,
            messageBody
        };
    }
}
