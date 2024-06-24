import {
  avatarStyles,
  betRoleStyles,
  ensBackgroundStyles,
  hStack,
  subTextStyles,
  vStack,
} from "./shared-styles";

export function UserCard(props: {
  alias: string;
  pfpUrl: string;
  role: "Proposer" | "Participant";
}) {
  return (
    <div
      style={{
        ...hStack,
        width: "35%",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          ...avatarStyles,
          ...ensBackgroundStyles,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.pfpUrl && (
          <img
            src={props.pfpUrl}
            width={92}
            height={92}
            style={{
              borderRadius: 9999,
              boxShadow: "2px 2px 100px 32px rgba(133, 93, 205, 0.3)",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <div style={{ ...vStack, marginLeft: 16 }}>
        <span>{props.alias}</span>
        <span style={{ ...betRoleStyles }}>{props.role}</span>
      </div>
    </div>
  );
}

export function BetAndUserInfoSection(props: {
  betId: string | number;
  creatorAlias: string;
  creatorPfpUrl: string;
  participantAlias: string;
  participantPfpUrl: string;
}) {
  return (
    <div style={{ ...vStack, width: "100%" }}>
      <span
        style={{ ...subTextStyles, marginBottom: 12 }}
      >{`Bet #${props.betId}`}</span>
      <div
        style={{
          ...hStack,
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 42,
        }}
      >
        <UserCard
          alias={props.creatorAlias}
          pfpUrl={props.creatorPfpUrl}
          role="Proposer"
        />
        <div style={{ display: "flex" }}>vs</div>
        <UserCard
          alias={props.participantAlias}
          pfpUrl={props.participantPfpUrl}
          role="Participant"
        />
      </div>
    </div>
  );
}
