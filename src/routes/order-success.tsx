import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import * as z from "zod";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({
    orderNumber: z.string().optional(),
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderNumber } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-16 px-4 md:px-8 flex flex-col items-center selection:bg-black selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-center border border-zinc-100"
      >
        <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
          Order Confirmed
        </h1>

        <p className="text-zinc-500 text-lg mb-8">
          Thank you for shopping with us! We've received your order and will begin processing it
          right away.
        </p>

        {orderNumber && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Order Number
                </p>
                <p className="font-mono text-xl font-bold text-black">{orderNumber}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 rounded-full bg-black text-white font-bold uppercase tracking-wider text-sm hover:bg-zinc-800 transition-colors gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
