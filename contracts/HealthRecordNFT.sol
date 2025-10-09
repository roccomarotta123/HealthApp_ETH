// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Verifier.sol";


contract HealthRecordNFT is Initializable, ERC721Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    // Modificatore per permettere solo al proprietario dell'indirizzo di chiamare la funzione
    modifier onlyOwner(address owner) {
        require(msg.sender == owner, "Only owner");
        _;
    }
     
    Groth16Verifier public verifier;
    uint256 private _tokenIdCounter;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

     // Mapping per tracciare i token posseduti da ogni utente
    mapping(address => uint256[]) private _ownedTokens;
    // Nuova mappatura diretta CID -> tokenId
    mapping(string => uint256) private _cidToTokenId;

    // Mappature per memorizzare i metadati e gli ID dei pazienti
    mapping(uint256 => string) private _metadataCID;
    mapping(uint256 => string) private _patientId;
    mapping(uint256 => mapping(address => bool)) private _access;

    event MintedRecord(uint256 indexed tokenId, address indexed owner, string metadataCID, string patientId);
    event AccessGranted(uint256 indexed tokenId, address indexed grantee);
    event AccessRevoked(uint256 indexed tokenId, address indexed grantee);

    function initialize(address admin, address verifierAddress) public initializer {
        __ERC721_init("HealthRecord", "HREC");
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        verifier = Groth16Verifier(verifierAddress);
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
        _ownedTokens[to].push(tokenId);
        _cidToTokenId[metadataCID] = tokenId;
    

        emit MintedRecord(tokenId, to, metadataCID, patientId);
        return tokenId;
    }
    // Funzione per ottenere tutti i metadataCID di un owner
    function getAllMetadataCID(address owner) external view onlyOwner(owner) returns (string[] memory) {
        uint256[] storage tokens = _ownedTokens[owner];
        string[] memory cids = new string[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            cids[i] = _metadataCID[tokens[i]];
        }
        return cids;
    }

    function tokenMetadataCID(uint256 tokenId) external view returns (string memory) {
        require(hasAccess(tokenId, msg.sender));
        return _metadataCID[tokenId];
    }

    // Funzione di sola lettura: dato un CID restituisce il tokenId associato
    function getTokenIdByCID(string calldata cid) external view returns (uint256) {
        uint256 tokenId = _cidToTokenId[cid];
        require(tokenId != 0, "CID non trovato");
        return tokenId;
    }

    
    // Restituisce tutti i token posseduti da un indirizzo, solo se chiamato dal proprietario
    function tokensOfOwner(address owner) external view onlyOwner(owner) returns (uint256[] memory) {
        return _ownedTokens[owner];
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

    // Funzione di verifica proof ZKP per accedere alla cartella
    function accessWithProof(
        uint256 tokenId,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata publicInputs
    ) external {
        // Controlla se l’utente ha già accesso
        require(!hasAccess(tokenId, msg.sender), "Already has access");

        // Verifica la proof tramite il Verifier
        bool valid = verifier.verifyProof(a, b, c, publicInputs);
        require(valid, "Invalid proof");

        // Concede accesso all’utente
        _access[tokenId][msg.sender] = true;
        emit AccessGranted(tokenId, msg.sender);
    }
}