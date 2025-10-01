import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("HealthRecordNFT", function () {
  it("Dovrebbe permettere all'oracolo di mintare un record", async function () {
    const [admin, user] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("HealthRecordNFT");
    const healthRecord = await upgrades.deployProxy(Factory, [admin.address], { kind: 'uups' });
    await healthRecord.waitForDeployment();

    // assegna ruolo ORACLE all’admin
    const ORACLE_ROLE = await healthRecord.ORACLE_ROLE();
    await healthRecord.grantRole(ORACLE_ROLE, admin.address);

    // mint di un record
    const tx = await healthRecord.mintRecord(user.address, "ipfs://QmFakeCID", "patient123");
    await tx.wait();

    // verifica owner del tokenId 1
    expect(await healthRecord.ownerOf(1)).to.equal(user.address);
  });
});
