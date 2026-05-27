import React, { useState } from "react";
import { Subnet } from "../types";
import { Network, Server, Database, Globe, ArrowRight, ShieldAlert } from "lucide-react";

interface NetworkVisualizerProps {
  subnets: Subnet[];
  explanation: string;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ subnets, explanation }) => {
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(subnets[0] || null);

  // Group subnets by IP tier / purpose for neat tiered layering
  const publicSubnets = subnets.filter((s) => s.name.toLowerCase().includes("public") || s.purpose.toLowerCase().includes("alb"));
  const privateSubnets = subnets.filter((s) => s.name.toLowerCase().includes("private") || s.purpose.toLowerCase().includes("compute") || s.name.toLowerCase().includes("workload"));
  const isolatedSubnets = subnets.filter((s) => s.name.toLowerCase().includes("isolated") || s.name.toLowerCase().includes("database") || s.name.toLowerCase().includes("db"));

  return (
    <div id="network-visualizer-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Subnet Canvas */}
      <div id="subnet-mapping-canvas" className="lg:col-span-2 bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl transition-all text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="text-brand-accent w-5 h-5 animate-pulse" />
            <span className="font-semibold text-brand-text text-sm tracking-wide">Dynamic Multi-AZ VPC Segments</span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
            CIDR Block: 10.100.0.0/16
          </span>
        </div>

        {/* Network Layout: Three distinct security tiers */}
        <div className="space-y-4">
          
          {/* Tier 1: Public Subnets (Ingress / Direct Route) */}
          <div id="tier-public" className="bg-brand-surface-alt p-3 rounded-lg border border-brand-border">
            <div className="flex items-center gap-2 mb-2 text-xs text-brand-text-dim font-semibold tracking-wider uppercase">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Tier 1: Public Ingress Edge (Internet Router / ALB Gateway)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {publicSubnets.map((sub, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSubnet(sub)}
                  className={`p-3 rounded-md cursor-pointer transition-all border text-left ${
                    selectedSubnet?.cidr === sub.cidr
                      ? "bg-blue-500/10 border-blue-500 shadow-md"
                      : "bg-brand-bg border-brand-border hover:border-brand-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-400 font-bold">{sub.cidr}</span>
                    <span className="text-[10px] bg-brand-surface px-1 border border-brand-border rounded font-mono text-brand-text-dim">{sub.zone}</span>
                  </div>
                  <h4 className="text-xs text-brand-text font-medium mt-1 truncate">{sub.name}</h4>
                </div>
              ))}
              {publicSubnets.length === 0 && (
                <p className="text-xs text-brand-text-dim">No public ingress subnets detected.</p>
              )}
            </div>
          </div>

          {/* Tier 2: Private Workloads (Locked from Direct Access, Needs NAT/PrivateLink) */}
          <div id="tier-private" className="bg-brand-surface-alt p-3 rounded-lg border border-brand-border">
            <div className="flex items-center gap-2 mb-2 text-xs text-brand-text-dim font-semibold tracking-wider uppercase">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tier 2: Private Workloads Compute Space (Zero Public IPs)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {privateSubnets.map((sub, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSubnet(sub)}
                  className={`p-3 rounded-md cursor-pointer transition-all border text-left ${
                    selectedSubnet?.cidr === sub.cidr
                      ? "bg-emerald-500/10 border-emerald-500 shadow-md"
                      : "bg-brand-bg border-brand-border hover:border-brand-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold">{sub.cidr}</span>
                    <span className="text-[10px] bg-brand-surface px-1 border border-brand-border rounded font-mono text-brand-text-dim">{sub.zone}</span>
                  </div>
                  <h4 className="text-xs text-brand-text font-medium mt-1 truncate">{sub.name}</h4>
                </div>
              ))}
              {privateSubnets.length === 0 && (
                <p className="text-xs text-brand-text-dim">No private compute subnets detected.</p>
              )}
            </div>
          </div>

          {/* Tier 3: Isolated Database (Locked from Internet and Standard NAT Route entirely) */}
          <div id="tier-isolated" className="bg-brand-surface-alt p-3 rounded-lg border border-brand-border">
            <div className="flex items-center gap-2 mb-2 text-xs text-brand-text-dim font-semibold tracking-wider uppercase">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Tier 3: Highly Isolated Database & Secret Subnets</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {isolatedSubnets.map((sub, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSubnet(sub)}
                  className={`p-3 rounded-md cursor-pointer transition-all border text-left ${
                    selectedSubnet?.cidr === sub.cidr
                      ? "bg-purple-500/10 border-purple-500 shadow-md"
                      : "bg-brand-bg border-brand-border hover:border-brand-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 font-bold">{sub.cidr}</span>
                    <span className="text-[10px] bg-brand-surface px-1 border border-brand-border rounded font-mono text-brand-text-dim">{sub.zone}</span>
                  </div>
                  <h4 className="text-xs text-brand-text font-medium mt-1 truncate">{sub.name}</h4>
                </div>
              ))}
              {isolatedSubnets.length === 0 && (
                <p className="text-xs text-brand-text-dim">No isolated database subnets detected.</p>
              )}
            </div>
          </div>

        </div>

        {/* Dynamic ASCII Connectivity Flow chart */}
        <div className="mt-5 p-3 bg-brand-bg rounded border border-brand-border flex flex-wrap items-center justify-around text-xs font-mono text-brand-text-dim">
          <div className="flex items-center gap-1"><span className="text-emerald-400">⚡ Client Traffic</span></div>
          <ArrowRight className="w-3 h-3 text-brand-border" />
          <div className="flex items-center gap-1"><span className="text-blue-400">CloudFront WAF</span></div>
          <ArrowRight className="w-3 h-3 text-brand-border" />
          <div className="flex items-center gap-1"><span className="text-brand-accent">VPC ALB</span></div>
          <ArrowRight className="w-3 h-3 text-brand-border" />
          <div className="flex items-center gap-1"><span className="text-purple-400">Security Groups</span></div>
          <ArrowRight className="w-3 h-3 text-brand-border" />
          <div className="flex items-center gap-1"><span className="text-emerald-400">Fargate/VPC</span></div>
          <ArrowRight className="w-3 h-3 text-brand-border" />
          <div className="flex items-center gap-1"><span className="text-indigo-400">PrivateLink Endpoints</span></div>
        </div>
      </div>

      {/* Selected Subnet Detail / Explanations */}
      <div id="subnet-detail-panel" className="flex flex-col gap-4">
        {selectedSubnet ? (
          <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 bg-brand-bg rounded border border-brand-border">
                  <span className="text-xs text-brand-text-dim font-mono">Selected Segment</span>
                </div>
                <span className="text-xs font-mono text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20 uppercase font-semibold">Active</span>
              </div>
              
              <h3 className="text-lg font-bold text-brand-text mb-1 text-left">{selectedSubnet.name}</h3>
              <p className="text-sm text-brand-accent font-mono font-semibold mb-4 text-left">{selectedSubnet.cidr}</p>

              <div className="space-y-3 text-left">
                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <span className="text-xs uppercase text-brand-text-dim font-bold tracking-wide">Purpose & Responsibility</span>
                  <p className="text-sm text-brand-text mt-1">{selectedSubnet.purpose}</p>
                </div>

                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <span className="text-xs uppercase text-brand-text-dim font-bold tracking-wide">Availability Zone</span>
                  <p className="text-sm font-mono text-brand-text mt-1">{selectedSubnet.zone}</p>
                </div>

                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <span className="text-xs uppercase text-brand-text-dim font-bold tracking-wide">Egress Egress Routes</span>
                  <p className="text-xs text-brand-text-dim mt-1 font-mono">
                    {selectedSubnet.name.toLowerCase().includes("public")
                      ? "0.0.0.0/0 via Internet Gateway (IGW)"
                      : selectedSubnet.name.toLowerCase().includes("isolated") || selectedSubnet.name.toLowerCase().includes("db")
                      ? "No direct external traffic routing allowed (Isolated)"
                      : "0.0.0.0/0 via NAT Gateway endpoints (Private egress)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border text-xs text-brand-text-dim flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Restricted access enforced via AWS NACLs.</span>
            </div>
          </div>
        ) : (
          <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-xl flex-1 flex items-center justify-center text-brand-text-dim">
            Select a subnet segment to view active metadata routing logs.
          </div>
        )}

        {/* Network Theory Block */}
        <div className="bg-brand-surface-alt rounded-xl p-4 border border-brand-border text-xs text-left">
          <h4 className="font-bold text-brand-text mb-1">Architecture Note:</h4>
          <p className="text-brand-text-dim leading-relaxed">
            All subnets are mirrored symmetrically across different Availability Zones (AZs) for continuous high-availability with hot routing backups.
          </p>
        </div>
      </div>
    </div>
  );
};
