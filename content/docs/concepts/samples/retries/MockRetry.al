[Test]
procedure Summary_Recovers_AfterRateLimit()
var
    Mock: Codeunit "AIOS Mock";
    Client: Codeunit "AIOS Client";
    Request: Record "AIOS Chat Request";
    Result: Codeunit "AIOS Generate Result";
begin
    Mock.SetNextResponse('recovered');
    Mock.SetFailuresBeforeSuccess(2);
    Request.SetPrompt('Summarize this note');
    Request.SetMaxRetries(2);

    Result := Client.GenerateText(Mock.Model('mock-model'), Request);

    if Result.Output() <> 'recovered' then
        Error('Unexpected output: %1', Result.Output());
end;
