import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
export const publicRoutes: Routes = [...authRoute]
export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/home')),
        authority: [],
    },
    {
        key: 'SalaryManagement',
        path: '/salary-calculator',
        component: lazy(() => import('@/views/salary-management/Salary_List_User')),
        authority: [],
    },
    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/user-management',
        component: lazy(() => import('@/views/user-management/MainComponent')) as any,
        authority: [],
    },
    {
        key: 'RequestManagement',
        path: '/request-management',
        component: lazy(() => import('@/views/Requests-Management/SupervisorRequests')) as any,
        authority: [],
    },
    {
        key: 'RequestManagement.item22',
        path: '/request-dayoff-management',
        component: lazy(() => import('@/views/Requests-Management/SupervisorDayOffApproval')),
        authority: [],
    },
    {
        key: 'salary.report',
        path: '/salary-report',
        component: lazy(() => import('@/views/salary-management/SalaryHistory')),
        authority: [],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: lazy(() =>
            import('@/views/demo/GroupSingleMenuItemView')
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(() =>
            import('@/views/demo/GroupCollapseMenuItemView1')
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(() =>
            import('@/views/demo/GroupCollapseMenuItemView2')
        ),
        authority: [],
    },
    {
        key: 'attendance.records',
        path: '/attendance-records',
        component: lazy(() =>
            import('@/views/attendance/Attendance')
        ),
        authority: [],
    },
    {
        key: 'otandfieldwork.records',
        path: '/otandfieldwork-records',
        component: lazy(() =>
            import('@/views/attendance/OTandFieldWork')
        ),
        authority: [],
    },
    {
        key: 'dayoff.requests',
        path: '/dayoff-requests',
        component: lazy(() =>
            import('@/views/attendance/DayoffRequests')
        ),
        authority: [],
    },
    {
        key: 'user.profile',
        path: '/user-profile',
        component: lazy(() => import('@/views/user-page/user-profile/MainComponent')),
        authority: [],
    },
    {
        key: 'user.ot.fieldwork.requests',
        path: '/user-ot-fieldwork-requests',
        component: lazy(() => import('@/views/user-page/user-ot-fieldwork-requests/MainComponent')),
        authority: [],
    },
    {
        key: 'user.dayoff.requests',
        path: '/user-dayoff-requests',
        component: lazy(() => import('@/views/user-page/user-dayoff-requests/MainComponent')),
        authority: [],
    }

]
// component: lazy(() => import('@/views/user-management/Create_User')),
