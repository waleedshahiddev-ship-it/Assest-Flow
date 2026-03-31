import InviteRoleForm from "../ui/InviteRoleForm"
import { sendEmployeeInvite } from "../services/apiInvitations"

const InviteManager = () => {
    return (
        <InviteRoleForm
            targetRole="employee"
            senderRole="manager"
            sendInviteFn={sendEmployeeInvite}
            invitePathRole="employee"
            pageTitle="Invite an Employee"
            pageDescription="Invite an employee to join your company workspace."
        />
    )
}

export default InviteManager
