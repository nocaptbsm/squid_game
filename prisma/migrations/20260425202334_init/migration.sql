-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "RoundName" AS ENUM ('PRELIMINARY', 'RED_LIGHT_GREEN_LIGHT', 'HITCH_HIKE', 'SOUL_SEEKERS', 'GLASS_BRIDGE', 'THE_WRIGHT_WAY', 'CHOCOLATE_CRUCIBLE');

-- CreateEnum
CREATE TYPE "RoundResult" AS ENUM ('PENDING', 'SURVIVED', 'ELIMINATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "playerNumber" TEXT NOT NULL,
    "name" TEXT,
    "photoUrl" TEXT,
    "photoLocked" BOOLEAN NOT NULL DEFAULT false,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundStatus" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "round" "RoundName" NOT NULL,
    "status" "RoundResult" NOT NULL DEFAULT 'PENDING',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "RoundStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamLogin" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,

    CONSTRAINT "TeamLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_qrToken_key" ON "Player"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerNumber_key" ON "Player"("playerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RoundStatus_playerId_round_key" ON "RoundStatus"("playerId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLogin_playerId_key" ON "TeamLogin"("playerId");

-- AddForeignKey
ALTER TABLE "RoundStatus" ADD CONSTRAINT "RoundStatus_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLogin" ADD CONSTRAINT "TeamLogin_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
