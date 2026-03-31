import InviteRoleForm from "../ui/InviteRoleForm"
import { sendAdminInvite } from "../services/apiInvitations"

const InviteEmployer = () => {
    return (
        <InviteRoleForm
            targetRole="admin"
            senderRole="employer"
            sendInviteFn={sendAdminInvite}
            invitePathRole="admin"
            pageTitle="Invite an Admin"
            pageDescription="Invite an admin to help manage your company operations."
        />
    )
}

export default InviteEmployer
