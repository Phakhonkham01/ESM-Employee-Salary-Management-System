import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
export const publicRoutes: Routes = [...authRoute]
export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
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
        key: 'collapseMenu.item1',
        path: '/collapse-menu-item-view-1',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'collapseMenu.item2',
        path: '/collapse-menu-item-view-2',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
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
        key: 'attendanceMenu',
        path: '/group-attendance-menu-item-1',
        component: lazy(() =>
            import('@/views/attendance/Attendance')
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
        component: lazy(() =>  import('@/views/user-page/user-ot-fieldwork-requests/MainComponent')),
        authority: [],
    },
     {
        key: 'user.dayoff.requests',
        path: '/user-dayoff-requests',
        component: lazy(() =>  import('@/views/user-page/user-dayoff-requests/MainComponent')),
        authority: [],
    },
    // {
    //     key: 'attendanceMenu.item2',
    //     path: '/group-attendance-menu-item-2',
    //     component: lazy(() =>
    //         import('@/views/attendance/SalaryCalculation')
    //     ),
    //     authority: [],
    // },
    
]
        // component: lazy(() => import('@/views/user-management/Create_User')),
