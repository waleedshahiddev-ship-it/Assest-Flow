import InviteRoleForm from "../ui/InviteRoleForm"
import { sendManagerInvite } from "../services/apiInvitations"

const InviteAdmin = () => {
    return (
        <InviteRoleForm
            targetRole="manager"
            senderRole="admin"
            sendInviteFn={sendManagerInvite}
            invitePathRole="manager"
            pageTitle="Invite a Manager"
            pageDescription="Invite a manager to coordinate teams and processes in your company."
        />
    )
}

export default InviteAdmin
