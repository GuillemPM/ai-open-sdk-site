Mock: Codeunit "AIOS Mock";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
begin
    // No API key. Tests run offline
    Result := Client.GenerateText(
        Mock.Model('mock'),
        'Hello');
    Message(Result.Output());
end;
