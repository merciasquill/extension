import { cn } from "@/lib/utils";

export function InfoIcon({ className = "", size = 25, ...props }) {
  return (
    <svg
      className={cn("stroke-white", className)}
      fill="none"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.7076 18.3639L11.2933 19.7781C9.34072 21.7308 6.1749 21.7308 4.22228 19.7781C2.26966 17.8255 2.26966 14.6597 4.22228 12.7071L5.63649 11.2929M18.3644 12.7071L19.7786 11.2929C21.7312 9.34024 21.7312 6.17441 19.7786 4.22179C17.826 2.26917 14.6602 2.26917 12.7076 4.22179L11.2933 5.636M8.50045 15.4999L15.5005 8.49994"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function LogInIcon({ className = "", size = 25, ...props }) {
  return (
    <svg
      className={cn("stroke-white", className)}
      fill="none"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11985 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H15M10 7L15 12M15 12L10 17M15 12L3 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function LogOutIcon({ className = "", size = 25, ...props }) {
  return (
    <svg
      className={cn("stroke-white", className)}
      fill="none"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PowerIcon({ className = "", size = 25, ...props }) {
  return (
    <svg
      className={cn("stroke-white", className)}
      fill="none"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 7V12M8 8.99951C7.37209 9.83526 7 10.8742 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 10.8742 16.6279 9.83526 16 8.99951M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
