-- SINGLE accountRelation
table profile {
  name string 
  username string 
  profile_imageid string
  description string
}

-- LIST accountRelation
table comment {
  comment string
  created DateTime
  imageid string
  poststream string
}

-- LIST accountRelation
table post {
  title string
  body string
  created DateTime
  imageid string
}