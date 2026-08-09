MiniMax: Codeunit "AIOS MiniMax";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        MiniMax.Model('minimax-m2.5', ApiKey),
        'Generate a receiving checklist');
    Message(Result.Output());
end;
