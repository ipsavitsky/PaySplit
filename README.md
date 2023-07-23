# 🪓 PaySplit

Imagine if an employee of a web2-based company is trying to buy a ticket to a work conference and the company wants to reimburse a part of that cost to the employee. That would take submitting checks to the financial department, taking up valuable company time and would cause a the amount of paperwork would frustrate any person. Pay Split is a Safe{Protocol} plugin that allows the employer to set limits to financial reimbursement, and employees to choose where to spend them, saving both parties lots of paperwork and nerves.

We leverage the new Safe{Core} Protocols to automate every part of the process, of both accepting, calculating and rerouting assets. The limits are set as a parameter to the smart contract. An external call to a users wallet is made through a metamask boilerplate. We started considering and implementing crosschain interoperability through Axelar - so that plugin functionality can be accessed from any chain.

## 📊 Structure

- `contracts` - contains plugin smart contracts, deployed through `hardhat`
- `web` - contains web interface for the plugin, automatically deployed to `github-pages`. Deployed with `yarn`.
- `web/payer` - contains a bolierplate metamask wallet connection to simulate a user wallet. Deployed with `yarn`.

## 🔗 Principal of work (single chain)

1. The owner of the contract sets the reimbursement rate.
1. The employee initiates the payment to a third party.
1. Employees money accumulates on the plugin account.
1. The requestet transaction is sent to the third party from the SAFE Wallet.
1. All the funds from the plugin account can be "drained" to the SAFE Wallet on request of the owner.  

## 🔗 Related Links

- [ipsavitsky234.github.io](ipsavitsky234.github.io) - the deployed plugin web landing
- [0x2B899F5672C9da3310B8adCCAFb82D3f92D6Bc45](https://goerli.etherscan.io/address/0x4ab38A01121D95643f0FFA7e19D34685B9Bb14A8) - deployed plugin smart contract

Linea Smart contract transaction path:

1. [sender on Linea](https://explorer.goerli.linea.build/address/0x5ace08064f02974Cc9BC21D13d0F5e39f3B58aEf)
1. [axelar gateway](https://explorer.goerli.linea.build/tx/0x7cd430efe574e78d693bbf34c5ed08f2945ef84d4b2cd0b4273397d39ac4af81)
1. [the other side of the gateway](https://goerli.etherscan.io/address/0xe432150cce91c13a887f7D836923d5597adD8E31)
1. [plugin contract on gateway](https://goerli.etherscan.io/address/0x2B899F5672C9da3310B8adCCAFb82D3f92D6Bc45)

**https://goerli.etherscan.io/tx/0xd8295d845d0b94810dee5152dfe1e4a7e14eae71adbc43f319bd01007053c3fe - transaction to the plugin on the other side**

[Linea deployment RPC](https://linea-goerli.infura.io/v3/dd7c331ba8e544abbc52c63c7b160a54) - a requirement for Linea bounty