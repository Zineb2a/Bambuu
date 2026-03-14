import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BookOpen,
  Lightbulb,
  AlertCircle,
  LineChart,
  Target,
  Wallet,
  Plus,
  X,
  ChevronDown,
  Zap,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Trash2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import Layout from "../components/Layout";
import { useAuth } from "../providers/AuthProvider";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency } from "../lib/currency";
import {
  createInvestment,
  getInvestmentPricesInCurrency,
  getInvestmentTotalsInCurrency,
  listInvestments,
  removeInvestment,
} from "../lib/investments";
import type { InvestmentPosition } from "../types/investments";

type InvestmentType = "stock" | "crypto" | "etf" | "bond";

const COLORS = ["#A0C878", "#DDEB9D", "#8AB060", "#6B9440"];

export default function Investments() {
  const { user } = useAuth();
  const currency = useUserCurrency();
  const [activeTab, setActiveTab] = useState<"portfolio" | "learn" | "calculator">("portfolio");
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<"low" | "medium" | "high" | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("10");
  const [expectedReturn, setExpectedReturn] = useState("7");
  const [portfolio, setPortfolio] = useState<InvestmentPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "etf" as InvestmentType,
    shares: "",
    purchasePrice: "",
    currentPrice: "",
  });

  useEffect(() => {
    if (!user) {
      setPortfolio([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadInvestments = async () => {
      setIsLoading(true);
      try {
        const data = await listInvestments(user.id);
        if (isMounted) {
          setPortfolio(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInvestments();
    window.addEventListener("investmentsChanged", loadInvestments);

    return () => {
      isMounted = false;
      window.removeEventListener("investmentsChanged", loadInvestments);
    };
  }, [user]);

  const portfolioWithTotals = useMemo(
    () =>
      portfolio.map((investment) => ({
        ...investment,
        ...getInvestmentTotalsInCurrency(investment, currency),
      })),
    [currency, portfolio],
  );

  const totalInvested = portfolioWithTotals.reduce((sum, inv) => sum + inv.invested, 0);
  const currentValue = portfolioWithTotals.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGain = currentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  const portfolioData = [
    {
      name: "Stocks",
      value: portfolioWithTotals.filter((i) => i.type === "stock").reduce((sum, i) => sum + i.currentValue, 0),
    },
    {
      name: "Crypto",
      value: portfolioWithTotals.filter((i) => i.type === "crypto").reduce((sum, i) => sum + i.currentValue, 0),
    },
    {
      name: "ETFs",
      value: portfolioWithTotals.filter((i) => i.type === "etf").reduce((sum, i) => sum + i.currentValue, 0),
    },
    {
      name: "Bonds",
      value: portfolioWithTotals.filter((i) => i.type === "bond").reduce((sum, i) => sum + i.currentValue, 0),
    },
  ].filter((item) => item.value > 0);

  const performanceData = [
    { month: "Jan", value: totalInvested * 0.82 },
    { month: "Feb", value: totalInvested * 0.88 },
    { month: "Mar", value: totalInvested * 0.93 },
    { month: "Apr", value: totalInvested * 0.96 },
    { month: "May", value: totalInvested * 1.02 },
    { month: "Jun", value: currentValue },
  ];

  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <LineChart className="size-4" />;
      case "crypto":
        return <Zap className="size-4" />;
      case "etf":
        return <PieChartIcon className="size-4" />;
      case "bond":
        return <Shield className="size-4" />;
      default:
        return <DollarSign className="size-4" />;
    }
  };

  const calculateInvestmentGrowth = () => {
    const principal = parseFloat(investmentAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const years = parseFloat(timeHorizon) || 0;
    const rate = parseFloat(expectedReturn) / 100 || 0;

    const months = years * 12;
    let futureValue = principal * Math.pow(1 + rate / 12, months);

    for (let i = 0; i < months; i += 1) {
      futureValue += monthly * Math.pow(1 + rate / 12, months - i);
    }

    return futureValue.toFixed(2);
  };

  const learningResources = [
    {
      title: "What are Stocks?",
      description: "Stocks represent ownership in a company. When you buy a stock, you become a shareholder.",
      risk: "Medium to High",
      example: "Buying Apple stock means owning a tiny piece of Apple Inc.",
      tips: [
        "Start with companies you know and use",
        "Diversify across different sectors",
        "Think long-term (5+ years)",
      ],
    },
    {
      title: "Understanding Crypto",
      description: "Cryptocurrency is digital money that uses blockchain technology. Bitcoin and Ethereum are popular examples.",
      risk: "Very High",
      example: "Bitcoin is like digital gold - limited supply, used as a store of value.",
      tips: [
        "Only invest what you can afford to lose",
        "Start with small amounts to learn",
        "Research thoroughly before buying",
      ],
    },
    {
      title: "ETFs (Exchange-Traded Funds)",
      description: "ETFs are like investment baskets containing many stocks. They offer instant diversification.",
      risk: "Low to Medium",
      example: "S&P 500 ETF contains stocks of 500 large US companies.",
      tips: [
        "Great for beginners",
        "Lower fees than mutual funds",
        "Built-in diversification",
      ],
    },
    {
      title: "Bonds Explained",
      description: "Bonds are loans you give to companies or governments. They pay you interest over time.",
      risk: "Low",
      example: "Government bonds are very safe but offer lower returns.",
      tips: [
        "Good for preserving capital",
        "Provides steady income",
        "Less volatile than stocks",
      ],
    },
  ];

  const resetInvestmentForm = () => {
    setNewInvestment({
      name: "",
      type: "etf",
      shares: "",
      purchasePrice: "",
      currentPrice: "",
    });
    setShowAddInvestment(false);
  };

  const handleAddInvestment = async () => {
    if (
      !user ||
      !newInvestment.name ||
      !newInvestment.shares ||
      !newInvestment.purchasePrice ||
      !newInvestment.currentPrice
    ) {
      return;
    }

    const created = await createInvestment(user.id, {
      name: newInvestment.name,
      type: newInvestment.type,
      shares: parseFloat(newInvestment.shares),
      purchasePrice: parseFloat(newInvestment.purchasePrice),
      currentPrice: parseFloat(newInvestment.currentPrice),
      currency,
      originalPurchasePrice: parseFloat(newInvestment.purchasePrice),
      originalCurrentPrice: parseFloat(newInvestment.currentPrice),
    });

    setPortfolio((current) => [...current, created]);
    resetInvestmentForm();
    window.dispatchEvent(new Event("investmentsChanged"));
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (!user || !confirm("Are you sure you want to remove this investment?")) {
      return;
    }

    await removeInvestment(user.id, investmentId);
    setPortfolio((current) => current.filter((investment) => investment.id !== investmentId));
    window.dispatchEvent(new Event("investmentsChanged"));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Investment Learning Hub</h1>
          <p className="text-muted-foreground">Track your real portfolio and keep the educational tools alongside it.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === "portfolio" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="size-4" />
              <span>My Portfolio</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("learn")}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === "learn" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="size-4" />
              <span>Learn</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === "calculator" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="size-4" />
              <span>Calculator</span>
            </div>
          </button>
        </div>

        {activeTab === "portfolio" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Total Invested</div>
                <div className="text-2xl">{formatCurrency(totalInvested, currency)}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Current Value</div>
                <div className="text-2xl text-primary">{formatCurrency(currentValue, currency)}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Total Gain/Loss</div>
                <div className={`text-2xl ${totalGain >= 0 ? "text-primary" : "text-destructive"}`}>
                  {totalGain >= 0 ? "+" : ""}
                  {formatCurrency(totalGain, currency)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Return</div>
                <div className={`text-2xl flex items-center gap-1 ${parseFloat(totalGainPercent) >= 0 ? "text-primary" : "text-destructive"}`}>
                  {parseFloat(totalGainPercent) >= 0 ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                  {totalGainPercent}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <PieChartIcon className="size-5 text-primary" />
                  Portfolio Distribution
                </h3>
                {portfolioData.length > 0 ? (
                  <>
                    <div suppressHydrationWarning>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {portfolioData.map((entry, index) => (
                              <Cell key={`portfolio-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {portfolioData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No investments yet</div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <LineChart className="size-5 text-primary" />
                  Portfolio Performance
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="investments-colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#investments-colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="flex items-center gap-2">
                  <Wallet className="size-5 text-primary" />
                  My Holdings
                </h3>
                <button
                  onClick={() => setShowAddInvestment(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-4" />
                  Add Investment
                </button>
              </div>
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="p-12 text-center text-muted-foreground">Loading portfolio...</div>
                ) : portfolioWithTotals.length === 0 ? (
                  <div className="p-12 text-center">
                    <PieChartIcon className="size-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="mb-2">Start Your Investment Journey</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first investment to start tracking your real portfolio.
                    </p>
                    <button
                      onClick={() => setShowAddInvestment(true)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Add Investment
                    </button>
                  </div>
                ) : (
                  portfolioWithTotals.map((investment) => {
                    const prices = getInvestmentPricesInCurrency(investment, currency);
                    return (
                      <div key={investment.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                investment.type === "stock"
                                  ? "bg-primary/10 text-primary"
                                  : investment.type === "crypto"
                                    ? "bg-accent text-accent-foreground"
                                    : investment.type === "etf"
                                      ? "bg-secondary text-secondary-foreground"
                                      : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {getInvestmentIcon(investment.type)}
                            </div>
                            <div>
                              <div className="font-medium">{investment.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {investment.shares} shares · {formatCurrency(prices.currentPrice, currency)} each
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Source currency: {investment.currency}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{formatCurrency(investment.currentValue, currency)}</div>
                            <div className={`text-sm flex items-center justify-end gap-1 ${investment.change >= 0 ? "text-primary" : "text-destructive"}`}>
                              {investment.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                              {investment.change >= 0 ? "+" : ""}
                              {investment.changePercent.toFixed(2)}%
                            </div>
                            <button
                              onClick={() => handleDeleteInvestment(investment.id)}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                            >
                              <Trash2 className="size-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "learn" ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="size-6 text-primary mt-1" />
                <div>
                  <h3 className="mb-2">Start with Your Risk Tolerance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Understanding your risk tolerance helps you choose the right investments
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedRisk("low")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRisk === "low" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Shield className="size-5 mb-2 text-primary" />
                      <div className="font-medium mb-1">Low Risk</div>
                      <div className="text-xs text-muted-foreground">Prefer stability, minimal losses</div>
                    </button>
                    <button
                      onClick={() => setSelectedRisk("medium")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRisk === "medium" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Target className="size-5 mb-2 text-primary" />
                      <div className="font-medium mb-1">Medium Risk</div>
                      <div className="text-xs text-muted-foreground">Balanced approach, some volatility OK</div>
                    </button>
                    <button
                      onClick={() => setSelectedRisk("high")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRisk === "high" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Zap className="size-5 mb-2 text-primary" />
                      <div className="font-medium mb-1">High Risk</div>
                      <div className="text-xs text-muted-foreground">Seeking high returns, comfortable with losses</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {learningResources.map((resource) => (
                <details key={resource.title} className="bg-card border border-border rounded-xl overflow-hidden group">
                  <summary className="p-6 cursor-pointer hover:bg-muted/50 transition-colors list-none flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-5 text-primary" />
                      <div>
                        <h3>{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                      </div>
                    </div>
                    <ChevronDown className="size-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-6 pt-0 border-t border-border space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="size-4 text-amber-500" />
                      <span className="text-muted-foreground">Risk Level:</span>
                      <span className="font-medium">{resource.risk}</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Example:</div>
                      <div className="text-sm">{resource.example}</div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">Student Tips:</div>
                      <ul className="space-y-2">
                        {resource.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "calculator" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="mb-6 flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  Investment Growth Calculator
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Initial Investment ({currency})</label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Monthly Contribution ({currency})</label>
                    <input
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Time Horizon (Years)</label>
                    <input
                      type="number"
                      value={timeHorizon}
                      onChange={(e) => setTimeHorizon(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Expected Annual Return (%)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(e.target.value)}
                        className="flex-1"
                      />
                      <span className="font-medium w-12">{expectedReturn}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6">
                <h3 className="mb-6 flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  Projected Results
                </h3>
                <div className="space-y-6">
                  <div className="bg-card rounded-xl p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">Future Value</div>
                    <div className="text-4xl text-primary mb-2">{formatCurrency(parseFloat(calculateInvestmentGrowth()), currency)}</div>
                    <div className="text-sm text-muted-foreground">after {timeHorizon} years</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-1">Total Invested</div>
                      <div className="text-xl">
                        {formatCurrency(
                          parseFloat(investmentAmount || "0") +
                            parseFloat(monthlyContribution || "0") * parseFloat(timeHorizon || "0") * 12,
                          currency,
                        )}
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-1">Total Earnings</div>
                      <div className="text-xl text-primary">
                        {formatCurrency(
                          parseFloat(calculateInvestmentGrowth()) -
                            (parseFloat(investmentAmount || "0") +
                              parseFloat(monthlyContribution || "0") * parseFloat(timeHorizon || "0") * 12),
                          currency,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="size-4 text-muted-foreground" />
                      <span className="text-sm">Assumptions</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Returns are compounded monthly</li>
                      <li>• Historical average S&amp;P 500 return: ~10% annually</li>
                      <li>• Past performance doesn't guarantee future results</li>
                      <li>• Actual returns may vary significantly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <Lightbulb className="size-5 text-primary" />
                Sample Student Investment Scenarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setInvestmentAmount("500");
                    setMonthlyContribution("50");
                    setTimeHorizon("5");
                    setExpectedReturn("7");
                  }}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="size-4 text-primary" />
                    <span className="font-medium">Cautious Starter</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(500, currency)} initial + {formatCurrency(50, currency)}/month for 5 years at 7% return</div>
                </button>
                <button
                  onClick={() => {
                    setInvestmentAmount("1000");
                    setMonthlyContribution("100");
                    setTimeHorizon("10");
                    setExpectedReturn("8");
                  }}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="size-4 text-primary" />
                    <span className="font-medium">Balanced Builder</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(1000, currency)} initial + {formatCurrency(100, currency)}/month for 10 years at 8% return</div>
                </button>
                <button
                  onClick={() => {
                    setInvestmentAmount("2000");
                    setMonthlyContribution("200");
                    setTimeHorizon("15");
                    setExpectedReturn("10");
                  }}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="size-4 text-primary" />
                    <span className="font-medium">Ambitious Investor</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(2000, currency)} initial + {formatCurrency(200, currency)}/month for 15 years at 10% return</div>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showAddInvestment ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Add Investment</h3>
              <button onClick={resetInvestmentForm} className="p-1 rounded-lg hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newInvestment.name}
                onChange={(e) => setNewInvestment((current) => ({ ...current, name: e.target.value }))}
                placeholder="Investment name"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={newInvestment.type}
                onChange={(e) => setNewInvestment((current) => ({ ...current, type: e.target.value as InvestmentType }))}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
                <option value="etf">ETF</option>
                <option value="bond">Bond</option>
              </select>
              <input
                type="number"
                step="0.00000001"
                value={newInvestment.shares}
                onChange={(e) => setNewInvestment((current) => ({ ...current, shares: e.target.value }))}
                placeholder="Shares / units"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                step="0.01"
                value={newInvestment.purchasePrice}
                onChange={(e) => setNewInvestment((current) => ({ ...current, purchasePrice: e.target.value }))}
                placeholder={`Purchase price per share (${currency})`}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                step="0.01"
                value={newInvestment.currentPrice}
                onChange={(e) => setNewInvestment((current) => ({ ...current, currentPrice: e.target.value }))}
                placeholder={`Current price per share (${currency})`}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddInvestment}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Investment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
