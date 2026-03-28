import React, { useEffect } from 'react'
import { getUserRole } from "../services/apiInvitations"
import { useQuery } from "@tanstack/react-query"
import { useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'

const Invites = () => {

  const { user, isLoaded } = useUser()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["User Role", user?.id],
    queryFn: () => getUserRole(user?.id),
    enabled: isLoaded && !!user?.id
  })

  const navigate = useNavigate()

  if (isError) {
    throw new Error("Error while checking the user role")
  }

  useEffect(() => {
    if (!isLoading && data) {
      navigate(`/invites/${data}`)
    }
  }, [data])

  return (
    <>
    </>
  )
}

export default Invites