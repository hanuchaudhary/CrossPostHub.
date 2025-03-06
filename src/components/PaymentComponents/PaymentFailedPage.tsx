"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Home,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function PaymentFailedPage() {
  const [isRetrying, setIsRetrying] = useState(false);

  // Mock transaction data - in a real app, this would come from your database
  const transaction = {
    id: "cuid456",
    order_id: "ORD-87654321",
    amount: 4999,
    plan: {
      name: "Business Plan",
      duration: "Annual",
    },
    error: {
      code: "card_declined",
      message:
        "Your card was declined. Please try a different payment method or contact your bank.",
    },
    createdAt: new Date(),
  };

  const handleRetry = () => {
    setIsRetrying(true);
    // In a real app, you would redirect to the payment page or retry the payment
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const errorIconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="border-red-200 dark:border-red-800 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <motion.div
                variants={errorIconVariants}
                animate={["visible", "pulse"]}
                className="rounded-full bg-red-100 dark:bg-red-900 p-6"
              >
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </motion.div>
            </div>
            <CardTitle className="text-center text-2xl">
              Payment Failed
            </CardTitle>
            <CardDescription className="text-center">
              We couldn't process your payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div variants={itemVariants}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{transaction.error.message}</AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-lg bg-muted p-4 space-y-3"
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{transaction.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {transaction.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${(transaction.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{transaction.plan.name}</span>
              </div>
            </motion.div>

            <Separator />

            <motion.div variants={itemVariants} className="space-y-2">
              <h3 className="font-medium">What can you do?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>Check your card details and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>Try a different payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>Contact your bank to authorize the transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>Contact our support team for assistance</span>
                </li>
              </ul>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/transactions">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Transactions
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
