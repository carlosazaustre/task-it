import Image from 'next/image';

interface UserProfileProps {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
}

export function UserProfile({ name, role, initials, avatarUrl }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <span className="text-white text-sm font-semibold">{initials}</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">
          {name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {role}
        </span>
      </div>
    </div>
  );
}
