import React from 'react'
import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
} from 'react-icons/pi'
import { FaUserAlt } from 'react-icons/fa'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { GiReceiveMoney } from 'react-icons/gi'
export type NavigationIcons = Record<string, React.ReactNode>
import { FaMoneyBillTransfer } from 'react-icons/fa6'
const navigationIcon: NavigationIcons = {
    user: <FaUserAlt />,
    request: <GiReceiveMoney />,
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    moneysalary: <FaMoneyBillTransfer />,
}

export default navigationIcon
