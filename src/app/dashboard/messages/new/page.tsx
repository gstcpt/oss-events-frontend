"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, getUserById } from '@/lib/api/user';
import { saveDraft, sendMessageIntern, MessageInternal, draftData } from '@/lib/api/messages';
import { User } from '@/types/users';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewMessage() {
    const t = useTranslations('Dashboard.messages');
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [status, setStatus] = useState('');
    const isSubmitted = useRef(false);
    const [formData, setFormData] = useState<MessageInternal>({
        source: "Internal",
        status_for_sender: 0,
        status_for_receiver: 0,
        receiver_id: 0,
        subject: "",
        message: "",
        sender_id: 0,
        company_id: 0
    });

    useEffect(() => {
        const fetchUsers = async () => {
            if (user) {
                try {
                    if (searchParams.get('subject')) {
                        const fetchedUser = await getUserById(parseInt(searchParams.get('to') || '0'));
                        setUsers([fetchedUser]);
                    } else {
                        const fetchedUsers = await getUsers(user);
                        setUsers(fetchedUsers);
                        setSubject('');
                    }
                } catch (error) { toast.error(t('errorLoadingUsers')); }
            }
        };
        fetchUsers();
    }, [user, searchParams]);

    useEffect(() => {
        if (users.length > 0) {
            const to = searchParams.get('to');
            if (to) { setRecipient(to); }
        }
        const subjectParam = searchParams.get('subject');
        if (subjectParam) { setSubject(subjectParam); }
        const replyToIdParam = searchParams.get('replyToId');
        if (replyToIdParam) { setReplyToId(parseInt(replyToIdParam)); }
    }, [users, searchParams]);

    const draftStateRef = useRef({ recipient, subject, message });
    draftStateRef.current = { recipient, subject, message };

    useEffect(() => {
        return () => {
            const { recipient: currentRecipient, subject: currentSubject, message: currentMessage } = draftStateRef.current;
            if (!isSubmitted.current && currentRecipient && user) {
                const draftData: draftData = {
                    parent_message_id: replyToId,
                    source: 'Internal',
                    email: null,
                    sender_id: user.id,
                    receiver_id: parseInt(currentRecipient),
                    name: null,
                    phone: null,
                    subject: currentSubject || '',
                    message: currentMessage || '',
                    status_for_sender: 0,
                    status_for_receiver: 0,
                    company_id: user.company_id
                };
                saveDraft(draftData);
            }
        };
    }, [user, replyToId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!recipient) {
                toast.error(t('pleaseSelectRecipient'));
                return;
            }
            if (!subject) {
                toast.error(t('pleaseEnterSubject'));
                return;
            }
            if (!message) {
                toast.error(t('pleaseEnterMessage'));
                return;
            }
            if (parseInt(recipient) === user?.id) {
                toast.error(t('cannotSendToSelf'));
                return;
            }
            isSubmitted.current = true;
            const MessageInternal: MessageInternal = {
                ...formData,
                receiver_id: parseInt(recipient),
                subject: subject,
                message: message,
                status_for_sender: 1,
                sender_id: Number(user?.id),
                company_id: user?.company_id || 0,
                parent_message_id: replyToId,
            };
            await sendMessageIntern(MessageInternal);
            toast.success(t('messageSent'));
            router.push(`/dashboard/messages/sent`);
        } catch (error: any) { toast.error(error.message || t('errorSending')); }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('newMessage')}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="recipient">{replyToId ? t('replyTo') : t('to')}</Label>
                    <Select onValueChange={setRecipient} value={recipient} {...(replyToId ? { disabled: true } : {})}>
                        <SelectTrigger><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                        <SelectContent>{users.length > 0 && users.map((u) => (u.id !== user?.id && (<SelectItem key={u.id} value={String(u.id)}>{u.firstname} {u.lastname} ({u.email})</SelectItem>)))}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="subject">{t('subject')}</Label>
                    <Input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="message">{t('body')}</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={10} required />
                </div>
                <Button className="createBtn" type="submit">{t('send')}</Button>
                {status && <p className="mt-4 text-sm\">{status}</p>}
            </form>
        </div>
    );
}