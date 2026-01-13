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
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/dashboard/Dashbaord')),
        authority: [], 
    },
    {
        key: 'Salary_Calculator',
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
        key: 'collapseMenu.item2',
        path: '/salary-report',
        component: lazy(() => import('@/views/salary-management/SalaryHistory')),
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
