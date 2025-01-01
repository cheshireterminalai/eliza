import React, {
    createContext,
    type PropsWithChildren,
    type ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

interface BaseProps {
  className?: string;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="flex min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// Basic sidebar components with minimal functionality
export const Sidebar = ({ children, className = '' }: PropsWithChildren<BaseProps>) => {
  const { isOpen } = useSidebar();
  return (
    <div className={`w-64 h-screen bg-gray-100 p-4 transition-all duration-300 ${isOpen ? '' : '-translate-x-full'} ${className}`}>
      {children}
    </div>
  );
};

export const SidebarContent = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <div className="h-full">{children}</div>
);

export const SidebarGroup = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <div className="mb-4">{children}</div>
);

export const SidebarGroupLabel = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <h3 className="text-sm font-semibold mb-2 text-gray-600">{children}</h3>
);

export const SidebarGroupContent = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <div>{children}</div>
);

export const SidebarMenu = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <nav>{children}</nav>
);

export const SidebarMenuItem = ({ children, className = '' }: PropsWithChildren<BaseProps>) => (
  <div className="mb-1">{children}</div>
);

interface SidebarMenuButtonProps extends BaseProps {
  asChild?: boolean;
  children: ReactNode;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ children, asChild = false, className = '' }, ref) => {
    const buttonClass = `w-full text-left p-2 rounded hover:bg-gray-200 flex items-center gap-2 ${className}`;

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        className: buttonClass,
        ref,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClass}>
        {children}
      </button>
    );
  }
);

SidebarMenuButton.displayName = 'SidebarMenuButton';
