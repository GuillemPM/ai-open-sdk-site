Schema: Codeunit "AIOS Schema";
Fields: List of [JsonObject];
begin
    Fields.Add(Schema.Field('message', Schema.String()));
    ToolSet.Add('echo', 'Echoes the message argument back unchanged.', Schema.Object(Fields));
    Result := Client.GenerateText(Model, Request, ToolSet, 5);
end;
