procedure SummarizeNote(Model: Interface "AIOS Language Model"; Note: Text): Text
var
    Result: Codeunit "AIOS Generate Result";
begin
    if not TryGenerateSummary(Model, Note, Result) then begin
        // GetLastErrorText() names the error type and the provider message
        Message('The summary is not available right now: %1', GetLastErrorText());
        exit('');
    end;
    exit(Result.Output());
end;

[TryFunction]
local procedure TryGenerateSummary(Model: Interface "AIOS Language Model"; Note: Text; var Result: Codeunit "AIOS Generate Result")
var
    Client: Codeunit "AIOS Client";
begin
    Result := Client.GenerateText(Model, 'Summarize this customer note: ' + Note);
end;
