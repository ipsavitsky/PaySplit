# 🪓 PaySplit

Imagine if an employee of a web2-based company is trying to buy a ticket to a work conference and the company wants to reimburse a part of that cost to the employee. That would take submitting checks to the financial department, taking up valuable company time and would cause a the amount of paperwork would frustrate any person. Pay Split is a Safe{Protocol} plugin that allows the employer to set limits to financial reimbursement, and employees to choose where to spend them, saving both parties lots of paperwork and nerves.

We leverage the new Safe{Core} Protocols to automate every part of the process, of both accepting, calculating and rerouting assets. The limits are set as a parameter to the smart contract. An external call to a users wallet is made through a metamask boilerplate. We started considering and implementing crosschain interoperability through Axelar - so that plugin functionality can be accessed from any chain.

## Structure

- `contracts` - contains plugin smart contracts, deployed through hardhat
- `web` - contains web interface for the plugin, automatically deployed to `github-pages`. Deployed with yarn.
- `web/payer` - contains a bolierplate metamask wallet connection to simulate a user wallet. Deployed with yarn.

## Related Links

- [ipsavitsky234.github.io](ipsavitsky234.github.io) - the deployed plugin web landing
- [0x4ab38A01121D95643f0FFA7e19D34685B9Bb14A8](https://goerli.etherscan.io/address/0x4ab38A01121D95643f0FFA7e19D34685B9Bb14A8) - deployed plugin smart contract
- 