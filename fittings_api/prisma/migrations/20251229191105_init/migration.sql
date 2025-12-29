-- CreateEnum
CREATE TYPE "Role" AS ENUM ('consumer', 'admin');

-- CreateEnum
CREATE TYPE "SwingAnalysisStatus" AS ENUM ('submitted', 'scheduled', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "FittingRequestStatus" AS ENUM ('submitted', 'prepping', 'scheduled', 'canceled', 'completed');

-- CreateEnum
CREATE TYPE "AdminTaskType" AS ENUM ('acknowledge_request', 'schedule_swing_analysis', 'swing_analysis_completed', 'fitting_scheduled', 'fitting_canceled', 'fitting_completed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'consumer',
    "golf_club_size" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwingAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SwingAnalysisStatus" NOT NULL DEFAULT 'scheduled',
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FittingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "FittingRequestStatus" NOT NULL DEFAULT 'submitted',
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FittingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FittingProgress" (
    "id" TEXT NOT NULL,
    "fittingRequestId" TEXT NOT NULL,
    "step" "FittingRequestStatus" NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FittingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GettingStarted" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GettingStarted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTask" (
    "id" TEXT NOT NULL,
    "fittingRequestId" TEXT NOT NULL,
    "task" "AdminTaskType" NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SwingAnalysis" ADD CONSTRAINT "SwingAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingRequest" ADD CONSTRAINT "FittingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingProgress" ADD CONSTRAINT "FittingProgress_fittingRequestId_fkey" FOREIGN KEY ("fittingRequestId") REFERENCES "FittingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GettingStarted" ADD CONSTRAINT "GettingStarted_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_fittingRequestId_fkey" FOREIGN KEY ("fittingRequestId") REFERENCES "FittingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
