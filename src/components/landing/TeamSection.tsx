import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Rudraksh Kottalwar",
    role: "Frontend | UI/UX | Website",
    avatar: "RK",
  },
  {
    name: "Shubhranshu Jumde",
    role: "UI/UX | Documentation",
    avatar: "SJ",
  },
  {
    name: "Farhan Pathan",
    role: "Backend | App Core | Logic",
    avatar: "FP",
  },
  {
    name: "Aditya Yengalwar",
    role: "Cloud | Database Manager",
    avatar: "AY",
  },
  {
    name: "Md. Junaid Rehman",
    role: "Security | Intruder Detection",
    avatar: "MJ",
  },
];

const getAvatarColor = (index: number): string => {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-red-500 to-rose-500",
  ];
  return colors[index % colors.length];
};

export const TeamSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The talented individuals behind SecureVault v2.0
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {teamMembers.map((member, index) => (
            <GlassCard
              key={member.name}
              className="text-center hover:scale-105 transition-transform duration-300 p-4 sm:p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Avatar */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                  index
                )} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}
              >
                <span className="text-lg sm:text-xl font-bold text-white">
                  {member.avatar}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">
                {member.name}
              </h3>

              {/* Role */}
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {member.role}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
