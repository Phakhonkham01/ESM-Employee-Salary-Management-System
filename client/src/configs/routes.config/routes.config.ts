import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
export const publicRoutes: Routes = [...authRoute]
export type UserRole = 'Admin' | 'Supervisor' | 'Employee'

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Dasboard/DashboardMain')),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'SalaryManagement',
        path: '/salary-calculator',
        component: lazy(() => import('@/views/salary-management/Salary_List_User')),
        authority: ['Admin', 'Supervisor'],
    },
    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/user-management',
        component: lazy(() => import('@/views/user-management/MainComponent')) as any,
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'RequestManagement',
        path: '/request-management',
        component: lazy(() => import('@/views/Requests-Management/SupervisorRequests')) as any,
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'RequestManagement.item22',
        path: '/request-dayoff-management',
        component: lazy(() => import('@/views/Requests-Management/SupervisorDayOffApproval')),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'salary.report',
        path: '/salary-report',
        component: lazy(() => import('@/views/salary-management/SalaryHistory')),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'send-email.salary.report',
        path: 'send-salary-email',
        component: lazy(() => import('@/views/')),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: lazy(() =>
            import('@/views/demo/GroupSingleMenuItemView')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(() =>
            import('@/views/demo/GroupCollapseMenuItemView1')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(() =>
            import('@/views/demo/GroupCollapseMenuItemView2')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'attendance.records',
        path: '/attendance-records',
        component: lazy(() =>
            import('@/views/attendance/Attendance')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'otandfieldwork.records',
        path: '/otandfieldwork-records',
        component: lazy(() =>
            import('@/views/attendance/OTandFieldWork')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'dayoff.requests',
        path: '/dayoff-requests',
        component: lazy(() =>
            import('@/views/attendance/DayoffRequests')
        ),
        authority: ['Admin', 'Supervisor'],
    },
    {
        key: 'user',
        path: '/user-profile',
        component: lazy(() => import('@/views/user-page/user-profile/MainComponent')),
        authority: ['Employee'],
    },
    {
        key: 'user.ot.fieldwork.requests',
        path: '/user-ot-fieldwork-requests',
        component: lazy(() => import('@/views/user-page/user-ot-fieldwork-requests/MainComponent')),
        authority: ['Employee'],
    },
    {
        key: 'user.dayoff.requests',
        path: '/user-dayoff-requests',
        component: lazy(() => import('@/views/user-page/user-dayoff-requests/MainComponent')),
        authority: ['Employee'],
    }

]
// component: lazy(() => import('@/views/user-management/Create_User')),
