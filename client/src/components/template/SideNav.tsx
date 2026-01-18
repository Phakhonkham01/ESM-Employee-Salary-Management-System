import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import Logo from '@/components/template/Logo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import { useThemeStore } from '@/store/themeStore'
import { useSessionUser } from '@/store/authStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { Link } from 'react-router-dom'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'
import UserDropdown from './UserProfileDropdown'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    mode?: Mode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = true,
    background = true,
    className,
    contentClass,
    mode,
}: SideNavProps) => {
    const defaultMode = useThemeStore((state) => state.mode)
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )

    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const userAuthority = useSessionUser((state) => state.user.authority)

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav flex flex-col h-screen overflow-hidden', // Added flex-col and h-screen
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            {/* 1. Header Section (Logo) */}
            <div 
                className="side-nav-header flex flex-col justify-center"
                style={{ height: HEADER_HEIGHT }}
            >
                <Link
                    to={appConfig.authenticatedEntryPath}
                    className="flex items-center"
                >
                    <Logo
                        imgClass="max-h-10"
                        mode={mode || defaultMode}
                        type={sideNavCollapse ? 'streamline' : 'full'}
                        className={classNames(
                            sideNavCollapse 
                                ? 'mx-auto' // Center icon when collapsed
                                : LOGO_X_GUTTER,
                        )}
                    />
                </Link>
            </div>

            {/* 2. Content Section (Navigation) */}
            <div className={classNames('side-nav-content flex-grow overflow-hidden', contentClass)}>
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationConfig}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={userAuthority || []}
                    />
                </ScrollBar>
            </div>

            {/* 3. Footer Section (User Profile) */}
            <div className={classNames(
                'side-nav-footer py-4 border-t border-gray-200 dark:border-gray-700',
                sideNavCollapse ? 'flex justify-center' : 'px-4'
            )}>
                <UserDropdown />
            </div>
        </div>
    )
}

export default SideNav