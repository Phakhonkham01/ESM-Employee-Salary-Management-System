import { UserData } from '@/services/User_Page/api'
import { MdEmail, MdCake } from 'react-icons/md'
import { PiGenderIntersex } from 'react-icons/pi'
import {
    PiBuildingOfficeLight,
    PiFinnTheHumanLight,
    PiMoneyFill,
    PiTextAa,
} from 'react-icons/pi'
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md'
import { ActionButton, ProfileField, formatDate } from './HelperCompents'

type Props = {
    user: UserData
}

const UserProfile = ({ user }: Props) => {
    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 relative">
                <div className="absolute -bottom-16 left-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user.first_name_en}+${user.last_name_en}&background=2563EB&color=fff`}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Name + Actions */}
            <div className="pt-20 px-8 pb-6 border-b border-slate-200">
                <div className="flex items-start justify-between gap-6">
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

                    <div className="flex gap-2 flex-wrap justify-end">
                        <ActionButton label="ສົ່ງຄຳຂໍ OT" />
                        <ActionButton label="ສົ່ງຄຳຂໍ ວຽກນອກ" />
                        {/* <ActionButton label="ສົ່ງຄຳຂໍ ມື້ພັກ" /> */}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="px-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ProfileField
                        label="Email"
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

export default UserProfile
