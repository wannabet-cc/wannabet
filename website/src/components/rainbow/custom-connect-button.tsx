import { Button } from "../ui/button";

export function CustomConnectButton() {
  return (
    <></>
    //     <ConnectButton.Custom>
    //       {({
    //         account,
    //         chain,
    //         openAccountModal,
    //         openChainModal,
    //         openConnectModal,
    //         mounted,
    //       }) => {
    //         const connected = mounted && account && chain;
    //         return (
    //           <div
    //             {...(!mounted && {
    //               "aria-hidden": true,
    //               className: "opacity-0 pointer-events-none select-none",
    //             })}
    //           >
    //             {(() => {
    //               if (!connected) {
    //                 return (
    //                   <Button
    //                     variant="default"
    //                     onClick={openConnectModal}
    //                     type="button"
    //                   >
    //                     Connect Wallet
    //                   </Button>
    //                 );
    //               }
    //               if (chain.unsupported) {
    //                 return (
    //                   <Button
    //                     variant="default"
    //                     onClick={openChainModal}
    //                     type="button"
    //                   >
    //                     Wrong network
    //                   </Button>
    //                 );
    //               }
    //               return (
    //                 <div className="flex items-center space-x-2">
    //                   {chain.hasIcon && (
    //                     <Button
    //                       variant="outline"
    //                       size="icon"
    //                       // onClick={openChainModal}
    //                     >
    //                       <div
    //                         className="h-5 w-5 overflow-hidden rounded-full"
    //                         style={{ background: chain.iconBackground }}
    //                       >
    //                         {chain.iconUrl && (
    //                           <img
    //                             alt={chain.name ?? "Chain icon"}
    //                             src={chain.iconUrl}
    //                             className="h-5 w-5"
    //                           />
    //                         )}
    //                       </div>
    //                     </Button>
    //                   )}
    //                   <div style={{ display: "flex", gap: 12 }}>
    //                     <Button
    //                       variant="outline"
    //                       onClick={openAccountModal}
    //                       type="button"
    //                     >
    //                       {account.displayName}
    //                     </Button>
    //                   </div>
    //                 </div>
    //               );
    //             })()}
    //           </div>
    //         );
    //       }}
    //     </ConnectButton.Custom>
    //   );
    // }

    // export function CustomConnectButtonSecondary() {
    //   return (
    //     <ConnectButton.Custom>
    //       {({ account, chain, openConnectModal, mounted }) => {
    //         const connected = mounted && account && chain;
    //         return (
    //           <div
    //             {...(!mounted && {
    //               "aria-hidden": true,
    //               className: "opacity-0 pointer-events-none select-none",
    //             })}
    //           >
    //             {(() => {
    //               if (!connected) {
    //                 return (
    //                   <Button
    //                     variant="outline"
    //                     onClick={openConnectModal}
    //                     type="button"
    //                   >
    //                     Connect Wallet
    //                   </Button>
    //                 );
    //               }
    //               return <></>;
    //             })()}
    //           </div>
    //         );
    //       }}
    //     </ConnectButton.Custom>
  );
}
