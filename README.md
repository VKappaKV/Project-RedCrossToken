# Project-RedCrossToken

A new donation system for fully transparent spending of donation money on the Algorand Blockchain.

This project is created only to showcase the concept for this use case, any reference is purely used to give an example.

### GHH3 work:
During the GHH3 we worked to improve this project, we wrote the contract and its PoC previously but it wasn't ready for deployment, so we have worked to test it out and adjust the contract. Created testing.js to interact with the contract and prepared the PoC for the box storage implementation to further extend the functionalities for this project, unluckily we weren't able to finish the contract for the boxes in time. The files for the box storage will be added to the repository once they are ready and deployed, but won't be part of our submission for the Algorand GHH3.

## Introduction

Voluntary societies are those associations that carry out non-profit activities with social, civil or cultural aims, and exclusively for the purpose of social solidarity. Often these societies propose fundraising campaigns, in which citizens can contribute by paying a certain amount of money. The money raised in this way is supposed to be used for charitable purposes associated with the company's field of work. However, these collected funds are not always used for their proper purpose and there is often no way to even verify how they were spent. The lack of transparency in this can create unease for contributors due to the lack of certainty of how their contributions are being used by the charitable company. This can also be a cause of less participation and contribution by citizens to this type of activity.
We have identified as an ideal use case the Italian Red Cross, for which the collection of food can often bring a use of resources not indifferent, time, staff and even the money of the volunteers spent in moving around the city to reach the various collection points.
For this problem the application we designed will allow to solve a 360 degrees problem, starting from a platform for purchasing products and funding online, implementing a transparent purchasing system using Algorand as a fast, secure and carbon negative payment rail.

## Idea

The proposed idea is to develop a blockchain-based solution involving the use of tokens as a substitute for the real money used for various donations. The token in question can be programmed to allow its use only for authorized purposes. In addition, the use of a public blockchain allows anyone, at any time, to verify how and when the funds collected were used.

The citizen, through a public portal, can buy a certain amount of tokens that will be available to the Red Cross, which will be able to use them for authorized services such as supermarkets to collect food, stationery, medicines and other products of daily use for families. Merchants who receive the tokens will be able to redeem them for fiat currencies at any time. In the future to promote charitable initiatives, supermarkets or other businesses participating on the platform will be able to offer discounts and promotions redeemable by the donor.
In addition to allowing a direct channel to charity the page offers a virtual shopping cart system to allow the user to directly buy necessities or even other products in the form of gifts, ensuring that anyone can participate in these collection activities at any level even with small amounts of money.
The proposed solution provides a fast and transparent system for anyone who wants to give to charity, which can also be used directly from their computer or mobile device. For the Red Cross, direct donations will help to have a balance of spending from which to draw. The virtual shopping cart platform will first of all allow to avoid imbalances in the composition of the stocks to be distributed, thus helping each family to receive everything they need. Finally, all this avoids a heavy workload for the volunteers, who will no longer have to move around the city and divide up the spaces in front of the supermarkets, spending many hours on several days per month in this service. In just one day the operators will be able to collect all the products previously purchased saving time, staff and money spent on fuel.

## Implementation choices

Algorand, thanks to its high throughput and instant finality, is a perfect platform for the implementation of the desired solution. The user experience offered respects the high standards that we can find in classic web 2.0 applications, but it also increases security and transparency due to the presence of a public and immutable registry.
For this application we have chosen to use the ARC0020, smart ASA specification. This ARC allows to put transfer logic inside an ASA token.
Further details are included in the written smart contract.
The web page will be structured as follows: registration page, homepage, donation and virtual cart. In the registration page the user can register through a digital identity system (in Italy we use the app IO or SPID), in the homepage the user will be able to select which Red Cross organization to help if the one in their city/municipality or any one in need. Once selected the Red Cross to which to make the donation it can be in two forms, a direct donation that will then allow the Red Cross to use those funds in the most appropriate way or through the virtual cart in which you can select which products to buy. In the virtual shopping cart the selection of products will be made through a first choice of a store or supermarket from a list, which to appear will have to be in contact with the Red Cross organization of the city, once selected the store where to shop will appear the list of products that it offers. The products purchased in the virtual shopping cart will be recorded and communicated to the Red Cross, which will be able to retrieve them at its discretion in times of need.

### Future implementation:

Algorand's box storage and contract to contract call functionalities added in the latest AVM versions opened an even further level of control for the ASA we are building. Here is the PoC of how the ASA contract will work once adjusted:

- box storage will be used to keep the ID of the items whitelisted for purchase, thus avoiding people spending the ASA on non appropriate products bought at a whitelisted merchant address
- the box will hold the merchant address as key and as value the array of items IDs (idealy 8 to 16 byte Literals each)
- once initiated the transaction one of the fields of the transaction will hold a byte sequence containing all the IDs of the purchased products, the byte sequence parsed in 8/16 byte elements into an array will be looped to check if each item is contained in the box with the merchant address as key
- if this check is passed and all the item are corrected the transaction will go through

## Conclusion

The proposed initiative could be an excellent solution in the field of charity to ensure transparency and proper use of the money provided by citizens.
Additionally, the platform provides Red Cross operators with a tool to help them during food collection periods, simplifying their work and increasing collection efficiency.
The model presented was designed for the Italian Red Cross use case, but the built ASA could be replicated in the future to serve other use cases and charitable initiatives.
