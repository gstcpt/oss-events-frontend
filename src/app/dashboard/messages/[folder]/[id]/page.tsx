"use client";
import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMessageById, markMessageAsRead, sendMessage, draftToSend, moveMessageToTrash, restoreMessage } from "@/lib/api/messages";
import { getUserById } from "@/lib/api/user";
import { useAuth } from "@/context/AuthContext";
import { MessageData, MessageFolder } from "@/types/messages";
import { UserReceiver, UserSender } from "@/types/users";
import moment from "moment";
import { ArrowLeft, Reply, Trash2, ArchiveRestore, Send, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";

export default function MessageView() {
    const t = useTranslations('Dashboard.messages');
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id ? parseInt(params.id as string, 10) : null;
    const folder = params.folder as MessageFolder;
    const [message, setMessage] = useState<MessageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [receiver, setReceiver] = useState<UserReceiver | null>(null);
    const [sender, setSender] = useState<UserSender | null>(null);
    useEffect(() => {
        if (id) {
            setLoading(true);
            getMessageById(id)
                .then((data) => {
                    setMessage(data);
                    if (folder === "inbox" && data && data.status_for_receiver === 0) { markMessageAsRead(id); }
                    setLoading(false);
                })
                .catch(() => {
                    setMessage(null);
                    setLoading(false);
                });
        }
    }, [id, folder]);
    useEffect(() => {
        if (message) {
            if (message.sender_id) { getUserById(message.sender_id).then((data) => setSender(data)).catch(() => setSender(null)); }
            if (message.receiver_id) { getUserById(message.receiver_id).then((data) => setReceiver(data)).catch(() => setReceiver(null)); }
        }
    }, [message]);
    const handleReply = () => { if (message) { router.push(`/dashboard/messages/new?to=${folder === "inbox" ? message.sender_id : message.receiver_id}&subject=${message.subject}&replyToId=${message.id}`); } };
    const handleSendMessage = async () => {
        if (message) {
            try {
                await draftToSend(message.id);
                if (typeof window !== "undefined") window.dispatchEvent(new Event("messages_updated"));
                toast.success("Message sent successfully!");
                router.push(`/dashboard/messages/sent`);
            } catch (error) { toast.error("Failed to send message"); }
        }
    };
    const handleTrash = async () => {
        if (id) {
            try {
                await moveMessageToTrash(id, folder);
                if (typeof window !== "undefined") window.dispatchEvent(new Event("messages_updated"));
                toast.success("Message moved to trash");
                router.push(`/dashboard/messages/${folder}`);
            } catch (error) { toast.error("Failed to move message to trash"); }
        }
    };
    const handleRestore = async () => {
        if (message && user) {
            try {
                await restoreMessage(message, user.id);
                if (typeof window !== "undefined") window.dispatchEvent(new Event("messages_updated"));
                toast.success("Message restored");
                router.push(`/dashboard/messages/trash`);
            } catch (error) { toast.error("Failed to restore message"); }
        }
    };
    if (loading) { return <p>Loading message...</p>; }
    if (!message) { return <p>Message not found.</p>; }
    return (
        <div className="card">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Link href={`/dashboard/messages/${folder}`} className="mr-4 p-2 rounded-full text-yellow-600 hover:bg-yellow-600"><ArrowLeft size={20} /></Link>
                        <h2 className="text-2xl font-semibold ">{message.subject}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        {folder === "draft" && (<Button onClick={handleSendMessage} className="p-2 rounded-full bg-transparent hover:bg-gray-100 text-green-600" title="Send Message"><Send size={20} /></Button>)}
                        {folder !== "trash" && folder !== "draft" && (<Button onClick={handleReply} className="p-2 rounded-full bg-transparent hover:bg-gray-100 text-blue-600" title="Reply"><Reply size={20} /></Button>)}
                        {folder !== "trash" && (<Button onClick={handleTrash} className="p-2 rounded-full bg-transparent hover:bg-gray-100 text-red-600" title="Move to Trash"><Trash2 size={20} /></Button>)}
                        {folder === "trash" && (<Button onClick={handleRestore} className="p-2 rounded-md bg-transparent text-green-600 hover:bg-green-600 hover:text-white"><ArchiveRestore className="w-5 h-5" /></Button>)}
                    </div>
                </div>
                <div className="border-b border-gray-200 pb-4 mb-4">
                    <p className="text-sm ">{folder !== "inbox" ? (<><strong>To:</strong> {receiver?.firstname} {receiver?.lastname} ({receiver?.email})</>) : (<><strong>From:</strong> {sender?.firstname} {sender?.lastname} ({sender?.email})</>)}</p>
                    <p className="text-sm "><strong>Date:</strong> {moment(message.created_at).format("MMMM Do YYYY, h:mm:ss a")}</p>
                </div>
                <div className="prose max-w-none ">
                    <p>Message: {message.message}</p>
                </div>
            </div>
        </div>
    );
}