import { MdEmail } from 'react-icons/md'
import { PiGenderIntersex } from 'react-icons/pi'
import { MdCake } from 'react-icons/md'
import {
    PiBuildingOfficeLight,
    PiFinnTheHumanLight,
    PiMoneyFill,
    PiTextAa,
} from 'react-icons/pi'
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md'
import { UserData } from '@/services/User_Page/api'

interface Props {
    user: UserData
}

const UserProfile = ({ user }: Props) => {
    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user.first_name_en}+${user.last_name_en}&background=0D8ABC&color=fff`}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* User Name + Buttons */}
            <div className="pt-20 px-8 pb-6 border-b border-slate-200">
                <div className="flex items-start justify-between gap-6">
                    {/* LEFT */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {user.first_name_en} {user.last_name_en}
                        </h2>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                {user.status}
                            </span>

                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT BUTTONS */}
                    <div className="grid grid-cols-3 gap-2">
                        <ActionButton label="ສົ່ງຄຳຂໍ OT" />
                        <ActionButton label="ສົ່ງຄຳຂໍ ວຽກນອກ" />
                        <ActionButton label="ສົ່ງຄຳຂໍ ມື້ພັກ" />
                    </div>
                </div>
            </div>

            {/* Information */}
            <div className="p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Email Address"
                        value={user.email}
                        icon={<MdEmail />}
                    />
                    <ProfileField
                        label="Department"
                        value={user.department_id?.department_name}
                        icon={<PiBuildingOfficeLight />}
                    />
                    <ProfileField
                        label="Position"
                        value={user.position_id?.position_name}
                        icon={<PiFinnTheHumanLight />}
                    />
                    <ProfileField
                        label="Base Salary"
                        value={`${user.base_salary?.toLocaleString()}₭`}
                        icon={<PiMoneyFill />}
                    />
                    <ProfileField
                        label="Full Name"
                        value={`${user.first_name_en} ${user.last_name_en}`}
                        icon={<PiTextAa />}
                    />
                    <ProfileField
                        label="Nickname"
                        value={user.nickname_en}
                        icon={<MdOutlineDriveFileRenameOutline />}
                    />
                    <ProfileField
                        label="Date of Birth"
                        value={formatDate(user.date_of_birth)}
                        icon={<MdCake />}
                    />
                    <ProfileField
                        label="Gender"
                        value={user.gender}
                        icon={<PiGenderIntersex />}
                    />
                </div>
            </div>
        </div>
    )
}

const ActionButton = ({ label }: { label: string }) => (
    <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold shadow-sm hover:bg-green-600 hover:shadow-md transition">
        {label}
    </button>
)

const ProfileField = ({
    label,
    value,
    icon,
}: {
    label: string
    value?: string
    icon: React.ReactNode
}) => (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
        <div className="text-3xl text-blue-600">{icon}</div>
        <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div className="text-base font-medium text-slate-900">
                {value || <span className="text-slate-400">Not specified</span>}
            </div>
        </div>
    </div>
)

const formatDate = (dateString?: string) => {
    if (!dateString) return undefined
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

export default UserProfile
