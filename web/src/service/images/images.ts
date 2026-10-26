/**
 * Registry of design token sheets, component sheets, and screen mockups.
 * References files located in web/screen/
 */

export const DESIGN_TOKENS = {
  TOKENS_SHEET: '/screen/Tokens-genie.png',
  COMPONENT_SHEET: '/screen/Component sheet-genie.png',
} as const;

export const SCREEN_MOCKUPS = {
  HOME: {
    DESKTOP_1440: '/screen/GENIE — Home page and login overlay-png/Home 1440.png',
    MOBILE_360: '/screen/GENIE — Home page and login overlay-png/Home 360.png',
  },
  LOGIN: {
    DESKTOP_OVERLAY_1440: '/screen/GENIE — Home page and login overlay-png/Login overlay 1440.png',
    MOBILE_OVERLAY_360: '/screen/GENIE — Home page and login overlay-png/Login overlay 360.png',
    STATES: '/screen/GENIE — Home page and login overlay-png/Login states.png',
  },
  APPSHELL: {
    DESKTOP_SIDEBAR: '/screen/GENIE appshell/Desktop sidebar by role.png',
    MOBILE_DRAWER_OPEN: '/screen/GENIE appshell/Mobile drawer (open).png',
    MOBILE_DRAWER_EMPLOYEE: '/screen/GENIE appshell/Mobile drawer · Employee.png',
    MOBILE_DRAWER_FINANCE: '/screen/GENIE appshell/Mobile drawer · Finance.png',
    MOBILE_DRAWER_TECHNICIAN: '/screen/GENIE appshell/Mobile drawer · Technician.png',
    MOBILE_TOPBAR_CLOSED: '/screen/GENIE appshell/Mobile top bar (closed).png',
  },
  REPORT_FAULT: {
    DESKTOP_1440: '/screen/GENIE report a fault/Report a fault · 1440.png',
    MOBILE_360: '/screen/GENIE report a fault/Report a fault · 360.png',
    STATES: '/screen/GENIE report a fault/States.png',
  },
  REQUEST_DETAILS: {
    GENERATOR_1440: '/screen/GENIE request details/Generator won’t start · 1440.png',
    GENERATOR_360: '/screen/GENIE request details/Generator won’t start · 360.png',
    MANAGER_COMPLETED_1440: '/screen/GENIE request details/Manager · Completed · 1440.png',
    MANAGER_COMPLETED_360: '/screen/GENIE request details/Manager · Completed · 360.png',
    MANAGER_REPORTED_1440: '/screen/GENIE request details/Manager · Reported · 1440.png',
    MANAGER_REPORTED_360: '/screen/GENIE request details/Manager · Reported · 360.png',
    ROLE_ACTIONS: '/screen/GENIE request details/Role actions.png',
    STATES: '/screen/GENIE request details/States.png',
    TECHNICIAN_IN_PROGRESS_1440: '/screen/GENIE request details/Technician · In progress · 1440.png',
    TECHNICIAN_IN_PROGRESS_360: '/screen/GENIE request details/Technician · In progress · 360.png',
  },
  REQUEST_LIST: {
    ALL_REQUESTS_1440: '/screen/GENIE request list/All requests · 1440.png',
    ALL_REQUESTS_360: '/screen/GENIE request list/All requests · 360.png',
    STATES: '/screen/GENIE request list/States.png',
  },
  MY_REQUESTS: {
    MY_REQUESTS_1440: '/screen/Genie - my request/My requests · 1440.png',
    MY_REQUESTS_360: '/screen/Genie - my request/My requests · 360.png',
    STATES: '/screen/Genie - my request/States.png',
  },
} as const;
