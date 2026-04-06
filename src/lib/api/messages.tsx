import { User } from "@/types/users";
import { apiFetch } from "../api";
import { MessageData, MessageFolder, MessageContact, MessageInternal, draftData } from "@/types/messages";

export const sendMessage = async (data: Partial<MessageData>) => {
    if (data.id) {return apiFetch(`/messages/${data.id}`, { method: "PATCH", body: JSON.stringify(data) });}
    return apiFetch("/messages", { method: "POST", body: JSON.stringify(data) });
};
export const sendMessageIntern = async (data: MessageInternal) => apiFetch("/messages", { method: "POST", body: JSON.stringify(data) });
export const sendMessageContact = async (data: MessageContact) => apiFetch("/messages", { method: "POST", body: JSON.stringify(data) });
export const getAllMessages = async () => apiFetch("/messages");
export const countAllMessagesGlobal = async () => apiFetch("/messages/countAll");
export const getMessageById = async (messageId: number) => apiFetch(`/messages/${messageId}`);
export const markMessageAsRead = async (messageId: number) => apiFetch(`/messages/${messageId}/mark-as-read`, { method: "PATCH" });
export const markMessageAsUnread = async (messageId: number) => apiFetch(`/messages/${messageId}/mark-as-unread`, { method: "PATCH" });
export const updateMessage = async (messageId: number, data: Partial<MessageData>) =>apiFetch(`/messages/${messageId}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteMessage = async (messageId: number) => apiFetch(`/messages/${messageId}`, { method: "DELETE" });
export const getMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}`);
export const countAllMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/count-all`);
export const getAllReadMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/read-all`);
export const countReadMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/count-read-all`);
export const getAllUnreadMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/unread-all`);
export const countUnreadMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/count-unread-all`);
export const countInternalMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/count-all-internal`);
export const countContactFormMessagesByCompany = async (companyId: number) => apiFetch(`/messages/company/${companyId}/count-all-contact`);
export const getUserInbox = async (userId: number) => apiFetch(`/messages/user/${userId}/inbox`);
export const countAllInboxMessagesByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/count-all-inbox`);
export const getLast5UserMessages = async (userId: number) => apiFetch(`/messages/user/${userId}/last-5`);
export const getInboxReadMessagesByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/inbox-read`);
export const countInboxReadMessagesByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/inbox-read-count`);
export const getInboxUnreadMessagesByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/inbox-unread`);
export const countInboxUnreadMessagesByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/inbox-unread-count`);
export const markAllInboxMessagesAsRead = async (userId: number) => apiFetch(`/messages/user/${userId}/mark-all-inbox-as-read`, { method: "PATCH" });
export const markAllInboxMessagesAsUnread = async (userId: number) =>apiFetch(`/messages/user/${userId}/mark-all-inbox-as-unread`, { method: "PATCH" });
export const moveInboxToTrash = async (messageId: number) => apiFetch(`/messages/${messageId}/move-inbox-to-trash`, { method: "PATCH" });
export const saveDraft = async (draftData: draftData) => {return apiFetch("/messages/draft", { method: "POST", body: JSON.stringify(draftData) });};
export const getDraftsByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/draft`);
export const countDraftsByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/draft-count`);
export const moveDraftToTrash = async (messageId: number) => apiFetch(`/messages/${messageId}/move-draft-to-trash`, { method: "PATCH" });
export const getSentByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/sent`);
export const countSentByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/sent-count`);
export const moveSentToTrash = async (messageId: number) => apiFetch(`/messages/${messageId}/move-sent-to-trash`, { method: "PATCH" });
export const getTrashByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash`);
export const countTrashByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash-count`);
export const getTrashReadByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash-read`);
export const countTrashReadByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash-read-count`);
export const getTrashUnreadByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash-unread`);
export const countTrashUnreadByUser = async (userId: number) => apiFetch(`/messages/user/${userId}/trash-unread-count`);
export const restoreFromTrashToInbox = async (messageId: number) =>apiFetch(`/messages/${messageId}/restore-from-trash-to-Inbox`, { method: "PATCH" });
export const restoreFromTrashToDraft = async (messageId: number) =>apiFetch(`/messages/${messageId}/restore-from-trash-to-draft`, { method: "PATCH" });
export const restoreFromTrashToSent = async (messageId: number) => apiFetch(`/messages/${messageId}/restore-from-trash-to-Sent`, { method: "PATCH" });
export const getDiscussionByUser = async (userId: number, otherUserId: number, rootMessageId?: number, markRead?: boolean) =>apiFetch(`/messages/user/${userId}/discussion/${otherUserId}/root/${rootMessageId}?markRead=${markRead}`);
export const getMessages = (folder: MessageFolder, userId: number) => {
    const folderEndpoints: Record<MessageFolder, string> = {
        inbox: `/messages/user/${userId}/inbox`,
        sent: `/messages/user/${userId}/sent`,
        draft: `/messages/user/${userId}/draft`,
        trash: `/messages/user/${userId}/trash`,
    };
    return apiFetch(folderEndpoints[folder]);
};
export const countMessages = (folder: MessageFolder, userId: number, read?: boolean) => {
    let url;
    if (read !== undefined) {
        const readStatus = read ? "read" : "unread";
        const countEndpoints: Record<MessageFolder, string> = {
            inbox: `/messages/user/${userId}/inbox-${readStatus}-count`,
            sent: "",
            draft: `/messages/user/${userId}/draft-count`,
            trash: "",
        };
        url = countEndpoints[folder];
    } else {
        const countEndpoints: Record<MessageFolder, string> = {
            inbox: `/messages/user/${userId}/count-all-inbox`,
            sent: `/messages/user/${userId}/sent-count`,
            draft: `/messages/user/${userId}/draft-count`,
            trash: `/messages/user/${userId}/trash-count`,
        };
        url = countEndpoints[folder];
    }
    if (!url) {return Promise.resolve(0);}
    return apiFetch(url);
};
export const moveMessageToTrash = (messageId: number, folder: MessageFolder) => {
    const moveEndpoints: Partial<Record<MessageFolder, string>> = {
        inbox: `/messages/${messageId}/move-inbox-to-trash`,
        sent: `/messages/${messageId}/move-sent-to-trash`,
        draft: `/messages/${messageId}/move-draft-to-trash`,
    };
    const url = moveEndpoints[folder];
    if (!url) {return Promise.reject("Invalid folder for moving to trash");}
    return apiFetch(url, { method: "PATCH" });
};
export const restoreMessage = async (message: MessageData, userId: number) => {
    if (message.sender_id === userId && message.status_for_sender === 3) {return restoreFromTrashToDraft(message.id);}
    if (message.sender_id === userId && message.status_for_sender === 2) {return restoreFromTrashToSent(message.id);}
    if (message.receiver_id === userId && (message.status_for_receiver === 2 || message.status_for_receiver === 3)) {return restoreFromTrashToInbox(message.id);}
    throw new Error("Unauthorized to restore this message");
};
export async function getCompanyUsers(company_id: number): Promise<User[]> { return apiFetch(`/messages/company/${company_id}`); }
export const draftToSend = async (id: number) => apiFetch(`/messages/${id}/draft-to-send`, { method: "PATCH" });
export const emptyTrash = async (id: number) => apiFetch(`/messages/empty-trash/${id}`, { method: "PATCH" });
export type { MessageData, MessageContact, MessageInternal, draftData };