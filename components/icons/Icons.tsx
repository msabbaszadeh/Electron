
import React from 'react';

// Fix: Changed "aria-hidden" value from string "true" to boolean true to fix type error.
const iconProps = {
  "aria-hidden": true,
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: "1.5",
  stroke: "currentColor",
};

export const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const CogIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" />
    </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const Bars3Icon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.684-.219-.684a2.25 2.25 0 00-1.555-1.555l-.684-.219.684-.219a2.25 2.25 0 001.555-1.555l.219-.684.219.684a2.25 2.25 0 001.555 1.555l.684.219-.684.219a2.25 2.25 0 00-1.555 1.555z" />
    </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg {...iconProps} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21c-2.305 0-4.47-.612-6.374-1.666z" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72-3.72a25.286 25.286 0 00-4.016-1.584A25.286 25.286 0 007.5 12.571a25.286 25.286 0 00-4.016 1.584l-3.72 3.72C.847 17.001 0 16.037 0 14.9v-4.286c0-.97.616-1.813 1.5-2.097 1.086-.337 2.246-.533 3.456-.533 1.21 0 2.37.196 3.456.533.884.284 1.5 1.128 1.5 2.097v1.488c0 .97-.616 1.813-1.5 2.097a24.89 24.89 0 01-3.456.533 24.89 24.89 0 01-3.456-.533c-.884-.284-1.5-1.128-1.5-2.097V8.511c.884-.284 1.5-1.128 1.5-2.097V5.286c0-1.136.847-2.1 1.98-2.193l3.72 3.72a25.286 25.286 0 004.016 1.584A25.286 25.286 0 0016.5 7.157a25.286 25.286 0 004.016-1.584l3.72-3.72C23.153 2.299 24 3.263 24 4.393v4.286c0 .97-.616 1.813-1.5 2.097a24.89 24.89 0 01-3.456.533 24.89 24.89 0 01-3.456-.533c-.884-.284-1.5-1.128-1.5-2.097V9.9c0-.97.616-1.813 1.5-2.097.373-.116.76-.21 1.156-.282z" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);

export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const PencilSquareIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const DocumentMagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12h3.75m-3.75 3h1.5M12 21a8.25 8.25 0 0 0 6.25-13.062c-1.336-.36-2.735-.558-4.25-.558-1.515 0-2.914.198-4.25.558A8.25 8.25 0 0 0 12 21Z" />
    </svg>
);

export const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export const PaperClipIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5h6M9 8.25h6M9 12h6M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zm3-1h2a1 1 0 011 1v0a1 1 0 01-1 1h-2a1 1 0 01-1-1v0a1 1 0 011-1z" />
    </svg>
);

export const FolderOpenIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg {...iconProps} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12h3.75m-3.75 3h1.5M12 21a8.25 8.25 0 006.25-13.062c-1.336-.36-2.735-.558-4.25-.558-1.515 0-2.914.198-4.25.558A8.25 8.25 0 0012 21z" />
    </svg>
);
