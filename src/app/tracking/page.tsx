import Link from "next/link";
import { Metadata } from "next";
import TrackingForm from "@/components/complaint/tracking-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Track Your Complaint",
  description: "Track the status of your anonymous complaint",
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">
            <Link href="/" className="hover:opacity-80">
              Complaint Hub
            </Link>
          </h1>
          <div className="flex gap-4">
            {" "}
            <Link href="/" passHref>
              <Button className="bg-black hover:bg-gray-800 text-white font-medium rounded-full shadow-md">
                Submit Complaint
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button className="bg-primary-600 hover:bg-primary-700 font-medium rounded-full shadow-md text-black">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
            Track Your Complaint
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Enter your tracking number below to check the status of your
            complaint.
          </p>
        </div>

        <TrackingForm />
      </main>
    </div>
  );
}
