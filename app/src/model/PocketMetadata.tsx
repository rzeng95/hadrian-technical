import React from "react";
import styled from "@emotion/styled";
import * as THREE from "three";

interface ModelEntity {
  bufferGeometry: THREE.BufferGeometry;
  color: string;
  entityId: string;
}

interface Props {
  color: string;
  pocket: string[];
  pocketIdx: number;
  isSelectedPocket: boolean;
  onSelectPocket: () => void;
}

const Container = styled.div({
  marginBottom: "20px",
});

const Header = styled.div({
  display: "flex",
  alignItems: "center",
});

interface ColorBadgeProps {
  color: string;
}

const ColorBadge = styled.div(({ color }: ColorBadgeProps) => ({
  backgroundColor: color,
  width: "20px",
  height: "20px",
  marginRight: "20px",
}));

const Title = styled.div({
  fontSize: "16px",
  fontWeight: "600",
  marginRight: "20px",
});

const Warning = styled.div({
  fontSize: "14px",
  fontWeight: "500",
  color: "#a64944",
  marginTop: "8px",
});

interface SelectButtonProps {
  isSelected: boolean;
}
const SelectButton = styled.button(({ isSelected }: SelectButtonProps) => ({
  border: "1px solid grey",
  borderColor: isSelected ? "#53ab3e" : "#a6a8a5",
  borderRadius: "4px",
  backgroundColor: "white",
  cursor: "pointer",
}));

const Metadata = styled.div({
  marginTop: "12px",
});

export const PocketMetadata = ({
  color,
  pocket,
  pocketIdx,
  isSelectedPocket,
  onSelectPocket,
}: Props) => {
  return (
    <Container>
      <Header>
        <ColorBadge color={color} />

        <Title>Pocket {pocketIdx}</Title>

        <SelectButton onClick={onSelectPocket} isSelected={isSelectedPocket}>
          Select Group
        </SelectButton>
      </Header>

      {pocket.length <= 2 && (
        <Warning>
          Since there are only {pocket.length} face(s) to this pocket, this
          group may be a chamfer instead of a pocket!
        </Warning>
      )}

      <Metadata>
        <div>Entity IDs: {JSON.stringify(pocket)}</div>
      </Metadata>
    </Container>
  );
};
