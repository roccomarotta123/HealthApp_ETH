// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract HealthRecordNFT is Initializable, ERC721Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    uint256 private _tokenIdCounter;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    mapping(uint256 => string) private _metadataCID;
    mapping(uint256 => string) private _patientId;
    mapping(uint256 => mapping(address => bool)) private _access;

    event MintedRecord(uint256 indexed tokenId, address indexed owner, string metadataCID, string patientId);
    event AccessGranted(uint256 indexed tokenId, address indexed grantee);
    event AccessRevoked(uint256 indexed tokenId, address indexed grantee);

    function initialize(address admin) public initializer {
        __ERC721_init("HealthRecord", "HREC");
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mintRecord(address to, string calldata metadataCID, string calldata patientId) external onlyRole(ORACLE_ROLE) returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _metadataCID[tokenId] = metadataCID;
        _patientId[tokenId] = patientId;

        emit MintedRecord(tokenId, to, metadataCID, patientId);
        return tokenId;
    }

    function tokenMetadataCID(uint256 tokenId) external view returns (string memory) {
        require(hasAccess(tokenId, msg.sender));
        return _metadataCID[tokenId];
    }
 
    function grantAccess(uint256 tokenId, address grantee) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner");
        _access[tokenId][grantee] = true;
        emit AccessGranted(tokenId, grantee);
    }

    function revokeAccess(uint256 tokenId, address grantee) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner");
        _access[tokenId][grantee] = false;
        emit AccessRevoked(tokenId, grantee);
    }

    function hasAccess(uint256 tokenId, address user) internal view returns (bool) {
        if (ownerOf(tokenId) == user) return true;
        return _access[tokenId][user];
    }
}