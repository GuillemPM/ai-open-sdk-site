Moonshot: Codeunit "AIOS Moonshot";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Moonshot.Model('kimi-k2.5', ApiKey),
        'Rewrite this item description');
    Message(Result.Output());
end;
