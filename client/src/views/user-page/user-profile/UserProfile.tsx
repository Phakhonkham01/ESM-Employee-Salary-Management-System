import { UserData } from '@/services/User_Page/user_api'
import { useState } from 'react'

import RequestModule from './module/RequestModule'
import DayOffModule from './module/DayOffModule'

import { MdEmail, MdCake } from 'react-icons/md'
import { PiGenderIntersex } from 'react-icons/pi'
import {
  PiBuildingOfficeLight,
  PiFinnTheHumanLight,
  PiMoneyFill,
  PiTextAa,
} from 'react-icons/pi'
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md'
import { ActionButton, ProfileField, formatDate } from './HelperComponents'

import {
  FaUmbrellaBeach,
  FaCalendarTimes,
  FaCalendarCheck,
} from 'react-icons/fa'
import { MdWorkOutline } from 'react-icons/md'

type Props = {
  user: UserData
}

const UserProfile = ({ user }: Props) => {
  const [openDayOff, setOpenDayOff] = useState(false)
  const [openRequest, setOpenRequest] = useState(false)
  const [requestType, setRequestType] = useState<'OT' | 'FIELD_WORK'>('OT')

  // ✅ Real data
  const leftVacationDays = user.vacation_days ?? 0
  const startWorkDate = user.start_work

  // 🔹 Dummy (replace later if you have real fields)
  const absenceDays = 2
  const totalVacationDays = 12

  return (
    <div className="bg-white/80 rounded-2xl shadow-xl overflow-hidden">
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

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap justify-end">
            <ActionButton
              label="ສົ່ງຄຳຂໍ OT"
              onClick={() => {
                setRequestType('OT')
                setOpenRequest(true)
              }}
            />
            <ActionButton
              label="ສົ່ງຄຳຂໍ ວຽກນອກ"
              onClick={() => {
                setRequestType('FIELD_WORK')
                setOpenRequest(true)
              }}
            />
            <ActionButton
              label="ຂໍລາພັກ (Day Off)"
              onClick={() => setOpenDayOff(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestModule
        open={openRequest}
        type={requestType}
        onClose={() => setOpenRequest(false)}
      />
      <DayOffModule open={openDayOff} onClose={() => setOpenDayOff(false)} />

      {/* Info */}
      <div className="px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ProfileField label="Email" value={user.email} icon={<MdEmail />} />
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
            value={user.date_of_birth ? formatDate(user.date_of_birth) : '-'}
            icon={<MdCake />}
          />
          <ProfileField
            label="Gender"
            value={user.gender}
            icon={<PiGenderIntersex />}
          />

          {/* ✅ Real */}
          <ProfileField
            label="Start Work Date"
            value={startWorkDate ? formatDate(startWorkDate) : '-'}
            icon={<MdWorkOutline />}
          />
          <ProfileField
            label="Remaining Vacation Days"
            value={`${leftVacationDays} days`}
            icon={<FaUmbrellaBeach />}
          />

          {/* 🔹 Dummy for now */}
          <ProfileField
            label="Total Vacation Entitlement"
            value={`${totalVacationDays} days`}
            icon={<FaCalendarCheck />}
          />
          <ProfileField
            label="Absence Days"
            value={`${absenceDays} days`}
            icon={<FaCalendarTimes />}
          />
        </div>
      </div>
    </div>
  )
}

export default UserProfile
