Schema: Codeunit "AIOS Schema";
Fields: List of [JsonObject];
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
begin
    Fields.Add(Schema.Field('summary', Schema.String()));
    Fields.Add(Schema.Field('score', Schema.Number()));
    Request.SetPrompt('Score this customer feedback');
    Request.SetOutput(Schema.Object(Fields));
    Result := Client.GenerateText(Model, Request);
    // Result.Output() is validated JSON text
end;
