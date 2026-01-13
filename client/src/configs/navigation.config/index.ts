import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'Salary_Calculator',
        path: '/salary-management',
        title: 'Home',
        translateKey: '',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
  
    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/user-management',
        title: "User Management",
        translateKey: '',
        icon: 'user',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'RequestManagement',
        path: '/request-management',
        title: "Request Management",
        translateKey: '',
        icon: 'request',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'collapseMenu',
        path: '',
        title: 'Salary Management',
        translateKey: '',
        icon: 'collapseMenu',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'Salary_Calculator',
                path: '/salary-calculator',
                title: 'Salary Calculator',
                translateKey: '',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'collapseMenu.item2',
                path: '/salary-report',
                title: 'Salary Reports',
                translateKey: '',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
 
    {
        key: 'attendanceMenu',
        path: '/attendance',
        title: 'Attendance',
        translateKey: '',
        icon: 'groupCollapseMenu',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'attendance.records',
                path: '/attendance-records',
                title: 'Attendance Records',
                translateKey: 'nav.Attendance.item1',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'dayoff.requests',
                path: '/dayoff-requests',
                title: 'Day off Requests',
                translateKey: 'nav.Attendance.item2',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            }
        ],
    },
  
     {
        key: 'User', 
        path: '/user',
        title: 'User',
        translateKey: '',
        icon: 'user',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'user.profile',
                path: '/user-profile',
                title: 'User Profile',
                translateKey: 'nav.UserProfile.item1',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'user.ot.fieldwork.requests',
                path: '/user-ot-fieldwork-requests',
                title: 'User OT/Field Work Requests',
                translateKey: 'nav.UserProfile.item2',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'user.dayoff.requests',
                path: '/user-dayoff-requests',
                title: 'User Day Off Requests',
                translateKey: 'nav.UserProfile.item2',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
